"""
Symptom Checker Service - Vector DB Powered
Uses ChromaDB for semantic symptom matching and LLM for analysis
"""

import os
from groq import Groq
import chromadb
import json

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize ChromaDB
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "medical_db")
db_client = chromadb.PersistentClient(path=db_path)

# Get existing collection
try:
    guidelines_collection = db_client.get_collection(name="nhsrc_guidelines")
    print("✅ [Symptom Checker] Connected to medical knowledge base")
except Exception as e:
    print(f"⚠️ [Symptom Checker] Warning: {e}")
    guidelines_collection = None


def analyze_symptoms(symptoms: list, duration: str = None, severity: int = None, body_part: str = None):
    """
    Analyze symptoms using vector DB and LLM
    
    Args:
        symptoms: List of symptom descriptions
        duration: How long symptoms have been present
        severity: Pain/discomfort level (1-10)
        body_part: Affected body area
    
    Returns:
        dict with risk_level, possible_conditions, recommendations
    """
    
    # Combine symptoms into query
    symptom_text = ", ".join(symptoms)
    query = f"Patient reports: {symptom_text}"
    
    if body_part:
        query += f" in {body_part}"
    if duration:
        query += f" for {duration}"
    if severity:
        query += f" with severity {severity}/10"
    
    print(f"🔍 [Symptom Checker] Analyzing: {query}")
    
    # Query vector DB for relevant medical knowledge
    relevant_guidelines = []
    if guidelines_collection:
        try:
            results = guidelines_collection.query(
                query_texts=[query],
                n_results=5
            )
            
            if results and results['documents']:
                relevant_guidelines = results['documents'][0]
                print(f"📚 [Symptom Checker] Found {len(relevant_guidelines)} relevant guidelines")
        except Exception as e:
            print(f"⚠️ [Symptom Checker] Vector search error: {e}")
    
    # Build context for LLM
    context = "\n\n".join(relevant_guidelines) if relevant_guidelines else "No specific guidelines found."
    
    # LLM Analysis Prompt
    system_prompt = """You are a medical AI assistant performing symptom analysis.
Based on the patient's symptoms and relevant medical guidelines, provide a structured assessment.

Your response MUST be valid JSON with this exact structure:
{
    "risk_level": "low|moderate|high|critical",
    "confidence": 0.0-1.0,
    "possible_conditions": [
        {
            "name": "condition name",
            "probability": "high|medium|low",
            "description": "brief explanation"
        }
    ],
    "red_flags": ["flag1", "flag2"],
    "recommendations": {
        "immediate_action": "what to do now",
        "timeframe": "when to seek care (e.g., '24 hours', 'immediately')",
        "self_care": ["tip1", "tip2"],
        "when_to_worry": ["warning sign 1", "warning sign 2"]
    },
    "specialist_referral": "type of doctor if needed, or null"
}

Risk Levels:
- critical: Life-threatening, call emergency services
- high: Urgent care needed within hours
- moderate: See doctor within 24-48 hours
- low: Self-care appropriate, monitor symptoms

Be conservative - when in doubt, recommend medical evaluation."""

    user_prompt = f"""Patient Information:
Symptoms: {symptom_text}
Body Part: {body_part or 'Not specified'}
Duration: {duration or 'Not specified'}
Severity: {severity or 'Not specified'}/10

Relevant Medical Guidelines:
{context}

Provide a comprehensive symptom analysis in JSON format."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        print(f"✅ [Symptom Checker] Analysis complete - Risk: {result.get('risk_level', 'unknown')}")
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ [Symptom Checker] JSON parse error: {e}")
        print(f"Raw response: {response_text}")
        # Fallback response
        return {
            "risk_level": "moderate",
            "confidence": 0.5,
            "possible_conditions": [
                {
                    "name": "Unable to determine",
                    "probability": "unknown",
                    "description": "Please consult a healthcare provider for proper evaluation"
                }
            ],
            "red_flags": [],
            "recommendations": {
                "immediate_action": "Consult a healthcare provider for proper evaluation",
                "timeframe": "within 24-48 hours",
                "self_care": ["Monitor symptoms", "Rest", "Stay hydrated"],
                "when_to_worry": ["Symptoms worsen", "New symptoms develop", "Severe pain"]
            },
            "specialist_referral": None
        }
    
    except Exception as e:
        print(f"❌ [Symptom Checker] Error: {e}")
        raise


def get_common_symptoms_by_body_part(body_part: str):
    """
    Return common symptoms for a given body part
    Useful for UI autocomplete/suggestions
    """
    symptom_catalog = {
        "head": ["Headache", "Dizziness", "Vision problems", "Ear pain", "Sinus pressure", "Jaw pain"],
        "chest": ["Chest pain", "Shortness of breath", "Cough", "Palpitations", "Wheezing"],
        "abdomen": ["Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Bloating"],
        "back": ["Back pain", "Muscle stiffness", "Numbness", "Tingling"],
        "limbs": ["Joint pain", "Swelling", "Weakness", "Numbness", "Rash"],
        "general": ["Fever", "Fatigue", "Weight loss", "Night sweats", "Chills"]
    }
    
    return symptom_catalog.get(body_part.lower(), [])


if __name__ == "__main__":
    # Test the symptom checker
    test_result = analyze_symptoms(
        symptoms=["severe headache", "nausea", "sensitivity to light"],
        duration="2 days",
        severity=8,
        body_part="head"
    )
    
    print("\n" + "="*50)
    print("TEST RESULT:")
    print(json.dumps(test_result, indent=2))
