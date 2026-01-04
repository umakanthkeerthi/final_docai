"""
Multi-Symptom Correlation Analysis
Analyzes symptom patterns and correlations using vector DB and AI
"""

import os
from groq import Groq
import chromadb
import json
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
current_dir_for_env = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir_for_env, ".env")
load_dotenv(env_path)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️ [Correlation] GROQ_API_KEY not found in environment")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)

# Initialize ChromaDB
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "medical_db")
db_client = chromadb.PersistentClient(path=db_path)

# Get existing collection
try:
    guidelines_collection = db_client.get_collection(name="nhsrc_guidelines")
    print("✅ [Correlation] Connected to medical knowledge base")
except Exception as e:
    print(f"⚠️ [Correlation] Warning: {e}")
    guidelines_collection = None


# Known symptom clusters (medical knowledge)
SYMPTOM_CLUSTERS = {
    "migraine": {
        "core_symptoms": ["headache", "nausea", "sensitivity to light", "vomiting"],
        "related_symptoms": ["dizziness", "visual disturbances", "sensitivity to sound", "neck pain"],
        "severity": "moderate to high"
    },
    "flu": {
        "core_symptoms": ["fever", "body aches", "fatigue", "cough"],
        "related_symptoms": ["sore throat", "runny nose", "headache", "chills"],
        "severity": "moderate"
    },
    "heart_attack": {
        "core_symptoms": ["chest pain", "shortness of breath", "arm pain"],
        "related_symptoms": ["sweating", "nausea", "dizziness", "jaw pain"],
        "severity": "critical"
    },
    "appendicitis": {
        "core_symptoms": ["abdominal pain", "nausea", "fever"],
        "related_symptoms": ["vomiting", "loss of appetite", "constipation"],
        "severity": "high"
    },
    "anxiety": {
        "core_symptoms": ["rapid heartbeat", "shortness of breath", "sweating"],
        "related_symptoms": ["trembling", "dizziness", "chest tightness", "fear"],
        "severity": "low to moderate"
    }
}


def analyze_symptom_correlation(symptoms: List[str]) -> Dict:
    """
    Analyze correlations between multiple symptoms
    
    Args:
        symptoms: List of symptom strings
        
    Returns:
        dict with cluster_matches, related_symptoms, correlation_strength
    """
    
    print(f"🔍 [Correlation] Analyzing {len(symptoms)} symptoms: {symptoms}")
    
    # Normalize symptoms (lowercase, strip)
    normalized_symptoms = [s.lower().strip() for s in symptoms]
    
    # 1. Find matching clusters
    cluster_matches = []
    for cluster_name, cluster_data in SYMPTOM_CLUSTERS.items():
        core_matches = sum(1 for symptom in normalized_symptoms 
                          if any(core in symptom or symptom in core 
                                for core in cluster_data["core_symptoms"]))
        
        related_matches = sum(1 for symptom in normalized_symptoms 
                             if any(rel in symptom or symptom in rel 
                                   for rel in cluster_data["related_symptoms"]))
        
        total_core = len(cluster_data["core_symptoms"])
        match_percentage = (core_matches / total_core) * 100 if total_core > 0 else 0
        
        if core_matches > 0:
            cluster_matches.append({
                "condition": cluster_name.replace("_", " ").title(),
                "core_matches": core_matches,
                "related_matches": related_matches,
                "match_percentage": round(match_percentage, 1),
                "severity": cluster_data["severity"],
                "confidence": "high" if match_percentage >= 75 else "medium" if match_percentage >= 50 else "low"
            })
    
    # Sort by match percentage
    cluster_matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # 2. Find related symptoms using vector DB
    related_symptoms = []
    if guidelines_collection and symptoms:
        try:
            query_text = " ".join(symptoms)
            results = guidelines_collection.query(
                query_texts=[query_text],
                n_results=3
            )
            
            if results and results['documents']:
                # Extract potential related symptoms from guidelines
                for doc in results['documents'][0]:
                    # Use LLM to extract symptoms from medical text
                    related = extract_related_symptoms_from_text(doc, symptoms)
                    related_symptoms.extend(related)
        except Exception as e:
            print(f"⚠️ [Correlation] Vector search error: {e}")
    
    # Remove duplicates and already mentioned symptoms
    related_symptoms = list(set(related_symptoms))
    related_symptoms = [s for s in related_symptoms if s.lower() not in normalized_symptoms]
    
    # 3. Calculate overall correlation strength
    correlation_strength = calculate_correlation_strength(symptoms, cluster_matches)
    
    result = {
        "cluster_matches": cluster_matches[:3],  # Top 3 matches
        "related_symptoms": related_symptoms[:5],  # Top 5 related
        "correlation_strength": correlation_strength,
        "symptom_count": len(symptoms),
        "analysis_summary": generate_correlation_summary(symptoms, cluster_matches)
    }
    
    print(f"✅ [Correlation] Found {len(cluster_matches)} cluster matches")
    return result


def extract_related_symptoms_from_text(medical_text: str, current_symptoms: List[str]) -> List[str]:
    """
    Use LLM to extract related symptoms from medical guideline text
    """
    try:
        prompt = f"""Given these symptoms: {', '.join(current_symptoms)}

And this medical guideline text:
{medical_text[:500]}

Extract ONLY additional symptoms that are commonly associated with these symptoms.
Return as a JSON array of strings.

Example: ["symptom1", "symptom2", "symptom3"]

Return ONLY the JSON array, nothing else."""

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Faster model for extraction
            messages=[
                {"role": "system", "content": "You extract symptoms from medical text. Return only JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )
        
        response = completion.choices[0].message.content.strip()
        
        # Parse JSON
        if "[" in response and "]" in response:
            start = response.index("[")
            end = response.rindex("]") + 1
            json_str = response[start:end]
            symptoms = json.loads(json_str)
            return symptoms if isinstance(symptoms, list) else []
        
        return []
    except Exception as e:
        print(f"⚠️ [Correlation] Extraction error: {e}")
        return []


def calculate_correlation_strength(symptoms: List[str], cluster_matches: List[Dict]) -> str:
    """
    Calculate overall correlation strength based on matches
    """
    if not cluster_matches:
        return "weak"
    
    top_match = cluster_matches[0]
    match_pct = top_match["match_percentage"]
    
    if match_pct >= 75:
        return "strong"
    elif match_pct >= 50:
        return "moderate"
    elif match_pct >= 25:
        return "weak"
    else:
        return "minimal"


def generate_correlation_summary(symptoms: List[str], cluster_matches: List[Dict]) -> str:
    """
    Generate human-readable summary of correlation analysis
    """
    if not cluster_matches:
        return f"Your {len(symptoms)} symptom(s) don't match any specific pattern. A medical evaluation is recommended."
    
    top_match = cluster_matches[0]
    
    if top_match["match_percentage"] >= 75:
        return f"Your symptoms strongly suggest {top_match['condition']} ({top_match['match_percentage']}% match). {top_match['core_matches']} core symptoms align."
    elif top_match["match_percentage"] >= 50:
        return f"Your symptoms moderately match {top_match['condition']} ({top_match['match_percentage']}% match). Consider medical evaluation."
    else:
        return f"Your symptoms partially match {top_match['condition']}, but further assessment is needed."


if __name__ == "__main__":
    # Test the correlation analysis
    test_symptoms = ["severe headache", "nausea", "sensitivity to light"]
    
    result = analyze_symptom_correlation(test_symptoms)
    
    print("\n" + "="*60)
    print("CORRELATION ANALYSIS RESULT:")
    print(json.dumps(result, indent=2))
