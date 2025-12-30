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
load_dotenv(os.path.join(current_dir, ".env"))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Database Connection
db_path = os.path.join(current_dir, "medical_db")
db_client = chromadb.PersistentClient(path=db_path)

# Collections
golden_coll = db_client.get_or_create_collection(name="golden_collection")
reference_coll = db_client.get_or_create_collection(name="reference_collection")

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
            model="llama-3.1-8b-instant",
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
            model="llama-3.1-8b-instant",
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

# --- CORE RAG LOGIC ---

def get_medical_response(user_query: str, session_id: str, chat_history: List[dict] = []):
    """
    Orchestrates the 2-Hop RAG flow (Diagnosis -> Guideline):
    1. Retrieve Patient State
    2. Update Memory
    3. HOP 1: Diagnostic Search (Find potential causes)
    4. HOP 2: Guideline Search (Find filtered patient advice)
    5. Generate Response with strict citations
    """
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
    1. ANALYZE the Patient State.
    2. USE "Approved Patient Guidelines" for advice.
    3. USE "Medical Context" (Diagnostic) to explain symptoms or "why" a condition matches, if specific guidelines are missing.
    4. CITATIONS: You MUST cite the page number. Format: (Page X).
    4. PROHIBITED: Do not prescribe drugs or dosages. If a guideline mentions drugs, say "The guidelines suggest consulting a doctor for medication."
    5. NEGATIVE CONSTRAINTS: Do NOT ask about "Topics to Skip".
    6. INTERACTION: Be empathetic. Ask 1-2 clarifying questions if needed.
    
    {gap_instruction}
    
    If gaps are present, prioritize ASKING. 
    If gaps are empty:
    1. Provide the "Home Care Advice" from the Guidelines.
    2. Do NOT generate a "Patient Case Summary" or "Summary Recommendation" section. 
    3. END your response with this EXACT phrase on a new line: "I have sufficient information. Please click 'End & Summarize' to get your formal report."
    
    If the answer is not in the guidelines, state that clearly.
    """

    messages_payload = [{"role": "system", "content": system_instruction}]
    for m in chat_history[-6:]:
        messages_payload.append({"role": m["role"], "content": m["content"]})
    messages_payload.append({"role": "user", "content": f"User Query: {user_query}"})

    
    # 3. N-Turn Nudge (Implicit Trigger)
    # If conversation is > 6 messages (3 turns), nudge user to close.
    if len(chat_history) >= 6:
        system_instruction += "\n\nNUDGE INSTRUCTION: The conversation is getting long. If the user's latest query seems answered or if they say 'ok'/'thanks', append this footer: '\n\n(If you have no other symptoms, let me know and I will generate a comprehensive Case Summary for you.)'"

    try:
        chat_completion = client.chat.completions.create(
            messages=messages_payload,
            model="llama-3.1-8b-instant",
            temperature=0.1,
        )
        return {
            "answer": chat_completion.choices[0].message.content,
            "sources": used_sources,
            "is_final": True if not missing_gaps else False
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

def generate_summary(session_id: str):
    """
    Generates a formal medical summary, guidelines, and disposition.
    """
    session = get_session(session_id)
    state = session.to_dict()
    
    # Construct a detailed context for the LLM
    fact_block = f"""
    CONFIRMED SYMPTOMS: {', '.join(state.get('confirmed_symptoms', []))}
    DENIED SYMPTOMS: {', '.join(state.get('denied_symptoms', []))}
    DURATION: {state.get('duration', 'Unknown')}
    MEDICATIONS: {state.get('medications_taken', 'None')}
    """
    
    prompt = f"""
    Act as a Senior Medical Officer Reviewing a Triage Case.
    
    CASE DATA:
    {fact_block}
    
    TASK:
    Generate a formal "Patient Case Summary" for the user.
    
    OUTPUT FORMAT (Markdown):
    # 📋 Patient Case Summary
    
    **1. Clinical Assessment**
    *   **Identified Symptoms:** [List confirmed symptoms]
    *   **Duration:** [Duration]
    *   **Current Status:** [Brief professional summary of the situation]

    **2. Home Care Guidelines (NHSRC)**
    *   [Provide 3-4 key bullet points of SAFE home advice based on the symptoms. Be specific.]

    **3. Doctor Consultation Advice**
    *   [CLEAR Verdict: "Consult Immediately", "Consult if Worsens", or "Home Care Sufficient"]
    *   [Explain WHY briefly]
    
    TONE: Professional, Reassuring, Clear.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a specialized medical summarizer."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Could not generate summary: {str(e)}"

# Test
if __name__ == "__main__":
    print("Chat Engine Loaded.")