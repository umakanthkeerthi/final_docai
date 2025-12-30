import os
import json
from groq import Groq
from dotenv import load_dotenv
from correlation_analyzer import analyze_symptom_correlation
import re
import chromadb

# Load env from current directory
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Initialize ChromaDB for RAG
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "medical_db")
db_client = chromadb.PersistentClient(path=db_path)

try:
    guidelines_collection = db_client.get_collection(name="nhsrc_guidelines")
    print("✅ [Triage] Connected to medical knowledge base (RAG)")
except Exception as e:
    print(f"⚠️ [Triage] RAG Warning: {e}")
    guidelines_collection = None

# Load Rules Global
EMERGENCY_RULES = []

def load_triage_rules():
    global EMERGENCY_RULES
    try:
        rule_path = os.path.join(os.path.dirname(__file__), "emergency_rules.json")
        if os.path.exists(rule_path):
            with open(rule_path, "r") as f:
                EMERGENCY_RULES = json.load(f)
            print(f"✅ [Triage] Loaded {len(EMERGENCY_RULES)} condition categories.")
        else:
            print("⚠️ [Triage] emergency_rules.json not found.")
    except Exception as e:
        print(f"❌ [Triage] Error loading rules: {e}")

# Initial Load
load_triage_rules()

def analyze_symptom(text: str):
    """
    Analyzes text against the JSON rules using Llama-3.3.
    Now includes multi-symptom correlation analysis.
    Returns structured dict {is_emergency, action, reasons, correlation_data...}
    """
    if not EMERGENCY_RULES:
        return {"error": "Rules not loaded", "is_emergency": False}
    
    if not GROQ_API_KEY:
         return {"error": "GROQ_API_KEY missing", "is_emergency": False}

    # Extract individual symptoms from text
    symptoms = extract_symptoms_from_text(text)
    
    # Run correlation analysis if multiple symptoms
    correlation_data = None
    if len(symptoms) >= 2:
        try:
            correlation_data = analyze_symptom_correlation(symptoms)
            print(f"✅ [Triage] Correlation analysis complete")
        except Exception as e:
            print(f"⚠️ [Triage] Correlation analysis failed: {e}")

    # --- 1. REGEX SAFETY NET ---
    # Manually check for high-risk keywords to ensure safety regardless of LLM response
    critical_keywords = [
        "chest pain", "heart attack", "can't breathe", "breathless", 
        "stroke", "numbness", "unconscious", "head injury", "bleeding"
    ]
    
    # SIMPLIFIED CHECK: Check if any keyword is simply present in the text
    is_critical_regex = any(kw in text.lower() for kw in critical_keywords)
    print(f"🔍 [Triage Warning] Input: '{text}', Match Found: {is_critical_regex}")
    
    # --- 2. LLM ANALYSIS ---
    system_prompt = f"""
    You are an expert Medical Triage AI.
    Compare User Input against these EMERGENCY RULES:
    {json.dumps(EMERGENCY_RULES)}

    INSTRUCTIONS:
    1. Check if symptoms match ANY condition in the list.
    2. SAFETY FIRST: If the user mentions "Chest Pain", "Breathing Difficulty", or "Stroke" symptoms, YOU MUST RETURN is_emergency: true.
    3. Respond VALID JSON only.
    
    JSON FORMAT:
    {{
        "is_emergency": boolean,
        "matched_condition": "Name of condition or null",
        "action": "Recommended action",
        "reason": "Brief explanation",
        "category": "Category Name or null"
    }}
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(completion.choices[0].message.content)
        result["DEBUG_MODE"] = "ACTIVE_V2"
        
        # --- 3. SAFETY OVERRIDE ---
        if is_critical_regex and not result.get("is_emergency"):
            print(f"⚠️ [Triage] Safety Override: Regex found critical keyword in '{text}'")
            result["is_emergency"] = True
            result["matched_condition"] = "Detected Critical Symptom (Safety Override)"
            result["action"] = "Immediate Medical Attention"
            result["reason"] = "Symptom matches critical emergency keyword list."
        
        # Add correlation data to result
        if correlation_data:
            result["correlation_analysis"] = correlation_data
        
        # Add RAG-based detailed analysis
        rag_summary = generate_rag_summary(text)
        if rag_summary:
            # Enhance the reason with RAG insights
            result["reason"] = rag_summary
        
        return result

    except Exception as e:
        print(f"Triage LLM Error: {e}")
        
        # FAIL-SAFE: Still apply regex check even if LLM fails
        if is_critical_regex:
            return {
                "is_emergency": True,
                "matched_condition": "Detected Critical Symptom (System Fail-Safe)",
                "action": "Immediate Medical Attention",
                "reason": "Symptom matches critical emergency keyword list. (AI System Recovery Mode)",
                "correlation_analysis": correlation_data
            }
            
        return {
            "is_emergency": False,
            "action": "System Error",
            "reason": str(e),
            "correlation_analysis": correlation_data
        }


def generate_rag_summary(symptom_text: str) -> str:
    """
    Generate detailed symptom analysis using RAG (ChromaDB + LLM)
    """
    if not guidelines_collection:
        return None
    
    try:
        # Query medical knowledge base
        results = guidelines_collection.query(
            query_texts=[symptom_text],
            n_results=3
        )
        
        if not results or not results['documents']:
            return None
        
        # Combine relevant medical guidelines
        context = "\n\n".join(results['documents'][0])
        
        # Generate summary using LLM with RAG context
        rag_prompt = f"""Based on these medical guidelines:

{context}

Analyze these symptoms: {symptom_text}

Provide a brief, helpful summary (2-3 sentences) that:
1. Explains what these symptoms might indicate
2. Provides practical advice
3. Mentions when to seek medical care

Be concise, clear, and helpful."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant. Provide clear, concise symptom analysis."},
                {"role": "user", "content": rag_prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        summary = completion.choices[0].message.content.strip()
        print(f"✅ [Triage] RAG summary generated")
        return summary
        
    except Exception as e:
        print(f"⚠️ [Triage] RAG summary error: {e}")
        return None


def extract_symptoms_from_text(text: str) -> list:
    """
    Extract individual symptoms from user input text
    Simple extraction - splits on common separators
    """
    # Common separators
    separators = [',', 'and', '&', ';', 'also', 'plus']
    
    # Replace separators with |
    for sep in separators:
        text = text.replace(f' {sep} ', '|')
    
    # Split and clean
    symptoms = [s.strip() for s in text.split('|') if s.strip()]
    
    # If no separators found, treat whole text as one symptom
    if len(symptoms) == 0:
        symptoms = [text.strip()]
    
    return symptoms
