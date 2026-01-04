import os
import chromadb
import json
from groq import Groq
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, TypedDict
from session_manager import get_session

# 1. Initialization
current_dir = os.path.dirname(os.path.abspath(__file__))
# Loading .env from current directory (backend)
load_dotenv(os.path.join(current_dir, ".env"), override=True)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Database Connection
db_path = os.path.join(current_dir, "medical_db_v2")
db_client = chromadb.PersistentClient(path=db_path)

# Collections
golden_coll = db_client.get_or_create_collection(name="golden_collection")
reference_coll = db_client.get_or_create_collection(name="reference_collection")

# --- TRANSLATION FUNCTION ---
def translate_to_patient_language(english_text: str, target_language: str) -> str:
    """
    Translates English medical response to patient's native language.
    This ensures clean separation: RAG works in English, output is translated.
    
    Args:
        english_text: The medical response in English
        target_language: Target language (e.g., "Telugu", "Hindi", "Tamil")
    
    Returns:
        Translated text in target language
    """
    # If target is English, return as-is
    if target_language.lower() == "english":
        return english_text
    
    translation_prompt = f"""
    You are a medical translator. Translate the following medical advice from English to {target_language}.
    
    RULES:
    1. Translate ONLY the text, maintaining medical accuracy.
    2. Keep technical medical terms and drug names in English (e.g., Paracetamol, ORS).
    3. Keep page citations like (Page 13) as-is.
    4. Do NOT add any English explanation after the translation.
    5. Output ONLY the translated text, nothing else.
    
    English Text:
    {english_text}
    
    {target_language} Translation:
    """
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"You are a professional medical translator. Translate to {target_language} only."},
                {"role": "user", "content": translation_prompt}
            ],
            temperature=0.3,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Translation Error: {e}")
        # Fallback: return English if translation fails
        return english_text

def extract_medical_status(user_message, history):
    """
    Uses LLM to extract structured facts from the conversation.
    """
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in history])
    
    prompt = f"""
    Analyze this medical conversation history and the latest user message.
    Extract the CURRENT KNOWN STATUS of the patient.
    
    IMPLICIT NEGATION LOGIC (CRITICAL):
    1. Check if the Assistant's LAST message asked about specific symptoms (e.g. "Fever, Vomiting, Duration?").
    2. Check if the User's reply provided a PARTIAL ANSWER (e.g. only answered "Duration").
    3. STRICT RULE: If the user provided a partial answer, you MUST assume "NO" for the unanswered symptoms.
       Example:
       Bot: "Do you have Fever or Vomiting?"
       User: "I have a headache." (User ignored both -> Mark Fever, Vomiting as DENIED).
       Bot: "History of Alcohol? Blood in stool? Duration?"
       User: "2 days." (User ignored Alcohol/Blood -> Mark Alcohol, Blood in stool as DENIED).
    
    CRITICAL: Only extract values EXPLICITLY stated by the user. Do not guess.
    If the user says they are UNSURE or DON'T KNOW about a topic, add it to "unsure_aspects".
    
    HANDLING REFUSALS (Metadata):
    If the Assistant asked for "Duration", "Age", or "Medications", and the User said "No", "Skip", or ignored it:
    -> You MUST add the string "Refused Duration", "Refused Age", or "Refused Medications" to the "denied_symptoms" list.
    Example: 
    Bot: "How long?" -> User: "No" -> denied_symptoms: ["Refused Duration"]
    
    History:
    {history_text}
    
    Latest User: "{user_message}"
    
    Return JSON ONLY:
    {{
       "confirmed_symptoms": ["list"],
       "denied_symptoms": ["list"],
       "unsure_aspects": ["list"],
       "duration": "...",
       "medications_taken": "..."
    }}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a specialized medical triagist. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Fact Extraction Error: {e}")
        return {}

# --- GAP ANALYSIS ---
def identify_data_gaps(fact_block, guideline_context):
    """
    Analyzes the patient state against guidelines to find missing decision-critical data.
    """
    if not guideline_context:
        return []

    prompt = f"""
    Act as a Strict Triage Checklist Validator.
    
    INPUTS:
    1. PATIENT STATE:
    {fact_block}
    
    2. GUIDELINES (Checklist):
    {guideline_context}
    
    ALGORITHM:
    For each mandatory decision-point in the GUIDELINES:
      a. Check if it is present in "CONFIRMED SYMPTOMS".
      b. Check if it is present in "DENIED SYMPTOMS".
      c. IF (a) OR (b) IS TRUE -> IGNORE IT (It is already answered).
      d. IF BOTH ARE FALSE -> ADD TO "missing_critical_info".
      
    CRITICAL RULE:
    If the Patient State contains "History of alcohol consumption" in DENIED SYMPTOMS, you MUST NOT ask for it again.
    
    Return JSON ONLY:
    {{
        "missing_critical_info": ["item 1", "item 2"]
    }}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a smart triage logic engine. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0
        )
        data = json.loads(completion.choices[0].message.content)
        raw_gaps = data.get("missing_critical_info", [])
        
        # --- PYTHON FILTERING ---
        # Aggressively remove gaps that are already denied (fuzzy match)
        # We parse the 'Patient State' block again or just pass state dict?
        # For now, we rely on the fact that LLM saw the denied list.
        # But to fix the specific "Alcohol or NSAID" issue:
        
        filtered_gaps = []
        # Extract DENIED list from fact_block (simple string parse)
        # "DENIED SYMPTOMS: a, b, c\n"
        denied_text = ""
        import re
        match = re.search(r"DENIED SYMPTOMS: (.*)", fact_block)
        if match:
            denied_text = match.group(1).lower()
        
        for gap in raw_gaps:
             # If significant words from gap are in denied_text, skip it
             # Simple heuristic: If gap has >3 words, and any 4-letter word is in denied_text?
             # Better: Split gap into tokens. If any noun-like token is in denied_text?
             
             # Even Simpler: Check if gap is "partially mentioned"
             gap_lower = gap.lower()
             
             # Custom check for the known failure case
             should_skip = False
             
             # 1. Token overlap
             # Allow 3-letter tokens (e.g. "Age", "Leg") but filter out common stop words
             gap_tokens = [t for t in gap_lower.replace(",", "").split() if len(t) >= 3]
             skip_words = ["pain", "symptoms", "history", "check", "signs", "presence", "patient", "about", "your", "with", "have"]
             
             for token in gap_tokens:
                 if token in denied_text and token not in skip_words:
                     should_skip = True
                     break
            
             if not should_skip:
                 filtered_gaps.append(gap)
                 
        return filtered_gaps
    except Exception as e:
        print(f"Gap Analysis Error: {e}")
        return []

# --- EMERGENCY LOGIC ---
def check_emergency(user_text: str) -> Optional[dict]:
    """
    Fast-path check against emergency_rules.json.
    Returns the specific emergency action if a match is found, else None.
    """
    try:
        rules_path = os.path.join(current_dir, "emergency_rules.json")
        if not os.path.exists(rules_path):
            return None
            
        with open(rules_path, "r", encoding="utf-8") as f:
            rules_data = json.load(f)
            
        rules_context = json.dumps(rules_data, indent=2)
        
        prompt = f"""
        ACT AS AN EMERGENCY TRIAGE DOCTOR.
        
        USER INPUT: "{user_text}"
        
        EMERGENCY RULES:
        {rules_context}
        
        TASK:
        1. Compare the User Input against the "symptoms" in the Emergency Rules.
        2. If the input matches ANY critical symptom (e.g. Chest pain, Difficulty breathing, Seizures, Unconscious), output the matching rule.
        3. Be STRICT. If it is just a "headache" (and not Thunderclap), do NOT match.
        4. If NO critical match, return NULL.
        
        RETURN JSON ONLY:
        {{
            "is_emergency": true/false,
            "matched_category": "...",
            "action_required": "...",
            "reasoning": "..."
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a Critical Care Triage Bot. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0
        )
        
        result = json.loads(completion.choices[0].message.content)
        if result.get("is_emergency"):
            return result
        return None
        
    except Exception as e:
        print(f"Emergency Check Error: {e}")
        return None

# --- CORE RAG LOGIC ---

def get_medical_response(user_query: str, session_id: str, chat_history: List[dict] = [], target_language: str = "English"):
    """
    Orchestrates the 2-Hop RAG flow (Diagnosis -> Guideline):
    1. Retrieve Patient State
    2. Update Memory
    3. HOP 1: Diagnostic Search (Find potential causes)
    4. HOP 2: Guideline Search (Find filtered patient advice)
    5. Generate Response with strict citations
    """
    
    # STEP 0: EMERGENCY INTERCEPTOR
    # We check the raw query immediately.
    emergency_status = check_emergency(user_query)
    if emergency_status:
        # SHORT CIRCUIT: Return emergency advice immediately without RAG
        action = emergency_status['action_required']
        category = emergency_status['matched_category']
        reason = emergency_status['reasoning']
        
        # We format this as a high-alert response
        emergency_msg = f"""
        🚨 **EMERGENCY DETECTED** 🚨
        
        **Condition**: {category}
        **Reason**: {reason}
        
        **IMMEDIATE ACTION REQUIRED**:
        {action}
        
        (This is an automated triage response. Please act immediately.)
        """
        
        # If target language is NOT English, we must translate this emergency alert too
        if target_language.lower() != "english":
             # Quick translation for safety
             trans_completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a crisis translator."},
                    {"role": "user", "content": f"Translate this emergency alert to {target_language} accurately:\n\n{emergency_msg}"}
                ]
             )
             emergency_msg = trans_completion.choices[0].message.content

        # Construct Structured Emergency Record
        import datetime
        structured_record = {
            "meta_data": {
                "session_id": session_id,
                "timestamp": datetime.datetime.now().isoformat()
            },
            "triage": {
                "emergency_level": "RED",
                "priority_score": 10,
                "recommended_action": action
            },
            "clinical_summary": {
                "presenting_symptoms": [category],
                "duration": "Acute/Unknown",
                "history_of_illness": f"Emergency Detected: {category}. Reason: {reason}"
            },
            "display_text": emergency_msg
        }

        return {
            "answer": emergency_msg,
            "sources": [{"page": "TRIAGE", "content": "Emergency Protocol", "type": "critical"}],
            "is_final": True,
            "structured_record": structured_record
        }

    session = get_session(session_id)
    new_facts = extract_medical_status(user_query, chat_history)
    session.merge_snapshot(new_facts)
    state = session.to_dict() 
    used_sources = [] 
    
    fact_block = f"""
    CONFIRMED SYMPTOMS: {', '.join(state.get('confirmed_symptoms', []))}
    DENIED SYMPTOMS: {', '.join(state.get('denied_symptoms', []))}
    TOPICS TO SKIP: {', '.join(state.get('unsure_aspects', []))}
    DURATION: {state.get('duration', 'Unknown')}
    """
    
    search_query = f"{user_query} {' '.join(state.get('confirmed_symptoms', []))}"
    
    # --- HOP 1: DIAGNOSTIC CONTEXT ---
    # Find chunks that explain WHAT this might be.
    # We explicitly look for chunks tagged as 'DIAGNOSTIC' to understand the condition.
    diag_results = reference_coll.query(
        query_texts=[search_query],
        n_results=2,
        where={"intent": "DIAGNOSTIC"} 
    )
    
    diagnostic_context = ""
    if diag_results['documents']:
        for i, doc in enumerate(diag_results['documents'][0]):
            meta = diag_results['metadatas'][0][i]
            page = meta.get('page_number', '?')
            diagnostic_context += f"[Diagnostic Ref: Page {page}] {doc}\n"
            used_sources.append({"page": page, "content": doc, "type": "diagnostic", "topic": "Diagnosis Context"})

    # --- HOP 2: PATIENT GUIDELINES ---
    # Find chunks that explain WHAT TO DO (safe for patients).
    # We deliberately exclude 'TREATMENT_PRO' chunks to avoid dosage hallucinations.
    # We filter only for 'GUIDELINE_PATIENT'.
    guide_results = reference_coll.query(
        query_texts=[search_query],
        n_results=3,
        where={"intent": "GUIDELINE_PATIENT"} 
    )
    
    golden_results = golden_coll.query(
        query_texts=[search_query],
        n_results=1
    )
    
    guideline_context = ""
    
    # --- STRUCTURED SOURCE COLLECTION ---
    # used_sources is initialized at the top
    
    # 2a. Golden Rules (High Priority)
    if golden_results['documents'] and golden_results['documents'][0] and golden_results['distances'][0][0] < 0.4:
        rule_content = golden_results['documents'][0][0]
        meta = golden_results['metadatas'][0][0]
        page = meta.get('page_number', '?')
        guideline_context += f"!!! CRITICAL PROTOCOL (Page {page}) !!!\n{rule_content}\n"
        used_sources.append({"page": page, "content": rule_content, "type": "critical"})

    # 2b. General Guidelines
    if guide_results['documents']:
        for i, doc in enumerate(guide_results['documents'][0]):
            meta = guide_results['metadatas'][0][i]
            page = meta.get('page_number', '?')
            topic = meta.get('topic', 'General')
            guideline_context += f"[Guideline: Page {page} | Topic: {topic}] {doc}\n"
            used_sources.append({"page": page, "content": doc, "type": "guideline", "topic": topic})

    # --- GAP ANALYSIS STEP ---
    # Smart Triage: Identify what we don't know yet.
    missing_gaps = identify_data_gaps(fact_block, guideline_context)
    
    gap_instruction = ""
    if missing_gaps:
        gap_list = ", ".join(missing_gaps)
        gap_instruction = f"""
        CRITICAL DATA GAPS IDENTIFIED: {gap_list}
        
        IMMEDIATE INSTRUCTION:
        1. You MUST ask about these specific gaps: {gap_list}.
        2. Do NOT provide full advice yet.
        3. Do NOT ask generic questions like "How do you feel?".
        
        """

    # --- GENERATION ---
    # NOTE: We now generate in English ONLY, then translate separately
    system_instruction = f"""
    You are an NHSRC Health Assistant.
    
    GOAL: Provide safe home-care guidance based *strictly* on the NHSRC manual.
    
    PATIENT STATE:
    {fact_block}
    
    MEDICAL CONTEXT (For your understanding only):
    {diagnostic_context}
    
    APPROVED PATIENT GUIDELINES (Use this for your answer):
    {guideline_context}
    
    INSTRUCTIONS:
    1. ANALYZE the Patient State in ENGLISH.
    2. USE "Approved Patient Guidelines" for advice.
    3. EXPLAIN symptoms using "Medical Context" if needed.
    4. CITATIONS: You MUST cite the page number. Format: (Page X).
    5. INTERACTION: Be empathetic.
    6. LANGUAGE: Respond in ENGLISH only. Your response will be translated later.
    
    {gap_instruction}
    
    If gaps are present, prioritized ASKING. 
    If gaps are empty:
    1. Provide the "Home Care Advice".
    """

    messages_payload = [{"role": "system", "content": system_instruction}]
    for m in chat_history[-6:]:
        messages_payload.append({"role": m["role"], "content": m["content"]})
    messages_payload.append({"role": "user", "content": f"User Query: {user_query} (Respond in {target_language})"})

    
    # 3. N-Turn Nudge (Implicit Trigger)
    # If conversation is > 6 messages (3 turns), nudge user to close.
    if len(chat_history) >= 6:
        system_instruction += "\n\nNUDGE INSTRUCTION: The conversation is getting long. If the user's latest query seems answered or if they say 'ok'/'thanks', append this footer: '\n\n(If you have no other symptoms, let me know and I will generate a comprehensive Case Summary for you.)'"

    try:
        chat_completion = client.chat.completions.create(
            messages=messages_payload,
            model="llama-3.3-70b-versatile",
            temperature=0.1,
        )
        answer = chat_completion.choices[0].message.content
        
        # --- LOGIC-FIRST FIX ---
        # Only suggest clicking the button if the LOGIC (missing_gaps) says we are truly done.
        # This prevents the "Split-Brain" bug where AI says "Click button" but button is hidden.
        if not missing_gaps:
             footer = "\n\n(I have sufficient information. Please click 'End & Summarize' to get your formal report.)"
             answer += footer
        
        # --- TRANSLATE TO PATIENT'S LANGUAGE ---
        # The answer is currently in English. Now translate it to target language.
        translated_answer = translate_to_patient_language(answer, target_language)
             
        # --- EMERGENCY INTERCEPTOR (Level Red JSON) ---
        # If emergency was detected, we must return the JSON immediately.
        structured_record = None
        if emergency_status:
            import datetime
            structured_record = {
                "meta_data": {
                    "session_id": session_id,
                    "timestamp": datetime.datetime.now().isoformat()
                },
                "triage": {
                    "emergency_level": "RED",
                    "priority_score": 10,
                    "recommended_action": emergency_status['action_required']
                },
                "clinical_summary": {
                    "presenting_symptoms": state.get('confirmed_symptoms', []),
                    "duration": state.get('duration', 'Unknown'),
                    "history_of_illness": f"Emergency Detected: {emergency_status['condition']}."
                },
                "display_text": f"## 🚨 EMERGENCY DETECTED\n\n**Condition:** {emergency_status['condition']}\n\n**Action:** {emergency_status['action_required']}"
            }

        return {
            "answer": translated_answer,  # Return translated answer instead of English
            "sources": used_sources,
            "is_final": True if not missing_gaps else False,
            "structured_record": structured_record 
        }
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg)
        with open("backend_error.log", "a") as f:
            f.write(f"\n--- ERROR ---\n{error_msg}\n")
        
        # Graceful fallback if Chroma fails (e.g. empty collection)
        return {
            "answer": f"System Maintenance: {str(e)}",
            "sources": [],
            "is_final": False
        }

def generate_summary(session_id: str, target_language: str = "English"):
    """
    Generates a formal medical summary, guidelines, and disposition.
    Translates the 'display_text' to target_language, but keeps JSON keys/enums in English.
    """
    session = get_session(session_id)
    state = session.to_dict()
    
    # Construct a detailed context for the LLM
    fact_block = f"""
    CONFIRMED SYMPTOMS: {', '.join(state.get('confirmed_symptoms', []))}
    DENIED SYMPTOMS: {', '.join(state.get('denied_symptoms', []))}
    DURATION: {state.get('duration', 'Unknown')}
    MEDICATIONS: {state.get('medications_taken', 'None')}
    TARGET DISPLAY LANGUAGE: {target_language}
    """
    
    prompt = f"""
    Act as a Senior Medical Officer Reviewing a Triage Case.
    
    CASE DATA:
    {fact_block}
    
    TASK:
    Generate a STRUCTURED JSON Patient Case Record.
    
    CRITICAL INSTRUCTIONS:
    1. **LANGUAGE**: The "display_text" content MUST be written in **{target_language}**.
    2. **JSON STRUCTURE**: The Keys (e.g. "triage") and Enums ("RED", "YELLOW") must remain in **ENGLISH**.
    3. **CONTENT**: You MUST include a "Home Care Guidelines" section in the display text.
    
    You must assess the "Emergency Level" based on NHSRC Guidelines:
    - RED: Critical/Life-Threatening.
    - YELLOW: Needs Consultation.
    - GREEN: Home Care / Routine.
    
    OUTPUT FORMAT (JSON ONLY):
    {{
      "meta_data": {{
        "session_id": "{session_id}",
        "timestamp": "ISO_DATE_HERE"
      }},
      "triage": {{
        "emergency_level": "RED | YELLOW | GREEN",
        "priority_score": 1-10,
        "recommended_action": "Consult Immediately | Schedule Appointment | Home Care"
      }},
      "clinical_summary": {{
        "presenting_symptoms": ["List confirmed symptoms..."],
        "duration": "{state.get('duration', 'Unknown')}",
        "history_of_illness": "Brief narrative of the condition..."
      }},
      "display_text": "# 📋 Patient Case Summary (In {target_language})\n\n**1. Clinical Assessment**\n* [Translate assessment to {target_language}]\n\n**2. Home Care Guidelines**\n* [Provide 3-4 specific NHSRC guidelines in {target_language}]\n\n**3. Doctor Consultation Advice**\n* [Translate advice to {target_language}]"
    }}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a specialized medical summarizer. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.2
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        # Fallback if JSON fails, return a partial object so frontend doesn't crash
        return {
            "meta_data": {"session_id": session_id},
            "triage": {"emergency_level": "UNKNOWN"},
            "display_text": f"Could not generate structured summary. Error: {str(e)}"
        }

# Test
if __name__ == "__main__":
    print("Chat Engine Loaded.")