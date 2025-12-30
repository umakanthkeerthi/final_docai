from fastapi import FastAPI, UploadFile, File, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import shutil
import json
from typing import List
from dotenv import load_dotenv

# --- IMPORT SERVICES ---
from chat_engine import get_medical_response, generate_summary
from triage_service import analyze_symptom
from prescription_analyzer import analyze_prescription
from auth_service import signup_user, login_user, add_profile

# Fix .env loading to be relative to this script
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# --- CONFIG & OTHERS ---
app = FastAPI()

# Enable CORS for seamless communication with your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL temporarily for robust testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=GROQ_API_KEY)

# --- DATA MODELS ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: List[ChatMessage] = []

class TriageRequest(BaseModel):
    text: str

class MessageSendRequest(BaseModel):
    patientId: str
    doctorId: str
    patientName: str
    doctorName: str
    message: str
    sender: str

# --- AUTH MODELS ---
class SignupRequest(BaseModel):
    email: str
    password: str
    phone: str
    address: str
    name: str
    age: int
    gender: str
    blood_group: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AddProfileRequest(BaseModel):
    email: str
    name: str
    age: int
    gender: str
    relation: str
    blood_group: str = None

# --- ROUTER ---
api_router = APIRouter(prefix="/api")

@api_router.post("/signup")
async def signup_endpoint(req: SignupRequest):
    result = signup_user(
        req.email, 
        req.password, 
        req.phone, 
        req.address, 
        {
            "name": req.name,
            "age": req.age,
            "gender": req.gender,
            "blood_group": req.blood_group
        }
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@api_router.post("/login")
async def login_endpoint(req: LoginRequest):
    result = login_user(req.email, req.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@api_router.post("/add_profile")
async def add_profile_endpoint(req: AddProfileRequest):
    result = add_profile(
        req.email,
        {
            "name": req.name,
            "age": req.age,
            "gender": req.gender,
            "relation": req.relation,
            "blood_group": req.blood_group
        }
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


# --- LEGACY/COMPATIBILITY DATA ---
# Simple in-memory storage for the demo. In production, this would be SQLite/Postgres.
MESSAGES_DB = [] 

# --- ENDPOINTS ---

@api_router.get("/auth/doctors")
async def get_doctors():
    """Mock Doctor List for Frontend Compatibility"""
    return {
        "success": True,
        "doctors": [
            {
                "id": "ai_doc_1", 
                "name": "Dr. AI (Guidelines)", 
                "specialization": "General Medicine / Triage",
                "available": True
            }
        ]
    }

class MessageSendRequest(BaseModel):
    patientId: str
    doctorId: str
    patientName: str
    doctorName: str
    message: str
    sender: str

@api_router.post("/messages/send")
async def send_message(req: MessageSendRequest):
    """
    Handles messaging. If sender is patient, triggers AI RAG response.
    """
    import time
    
    # 1. Save User Message
    user_msg_entry = {
        "id": f"msg_{len(MESSAGES_DB)+1}",
        "sender": "patient",
        "message": req.message,
        "timestamp": int(time.time() * 1000)
    }
    MESSAGES_DB.append(user_msg_entry)
    
    # 2. Generate AI Response (RAG)
    try:
        # Convert DB history to ChatFormat for the Engine
        chat_history = []
        for m in MESSAGES_DB:
            role = "user" if m["sender"] == "patient" else "assistant"
            chat_history.append({"role": role, "content": m["message"]})
            
        response_data = get_medical_response(req.message, req.patientId, chat_history)
        ai_text = response_data.get("answer", "I apologize, I could not generate a response.") if isinstance(response_data, dict) else str(response_data)
    except Exception as e:
        ai_text = f"I apologize, I encountered a technical error: {str(e)}"

    # 3. Save AI Message
    ai_msg_entry = {
        "id": f"msg_{len(MESSAGES_DB)+1}",
        "sender": "doctor",
        "message": ai_text,
        "timestamp": int(time.time() * 1000) + 100 # slight delay
    }
    MESSAGES_DB.append(ai_msg_entry)

    return {"success": True, "message": "Sent", "reply": ai_text}

@api_router.get("/messages/conversation")
async def get_conversation(patientId: str, doctorId: str):
    """Returns full chat history"""
    return {"success": True, "messages": MESSAGES_DB}

@api_router.post("/check_emergency")
async def check_emergency_endpoint(request: TriageRequest):
    """
    Rapid Triage Endpoint (Llama-3.3 + Rules).
    Decides if the patient needs an Ambulance or can proceed to Chat.
    """
    return analyze_symptom(request.text)


@api_router.post("/chat_with_guidelines")
async def chat_with_guidelines(request: ChatRequest):
    """
    State-Aware endpoint that passes history to the engine 
    to enable clinical reasoning and prevent redundant questioning.
    """
    try:
        # 1. Convert Pydantic models to simple dictionaries for the engine's fact extraction
        history_data = [m.model_dump() for m in request.history]
        
        # 2. Call the reasoning engine with the new message and full context
        # This allows the bot to follow the 'Localization Shortcut' from NHSRC Page 11
        response = get_medical_response(request.message, request.session_id, chat_history=history_data)
        
        return {"reply": response}
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Log the specific error for debugging during your demo
        raise HTTPException(status_code=500, detail=f"RAG Reasoning Error: {str(e)}")

# Router will be mounted at the end

class SummaryRequest(BaseModel):
    session_id: str

@api_router.post("/generate_summary")
async def get_summary(request: Request):
    """
    Generates a formal medical summary for the end of the consultation and saves it.
    """
    try:
        data = await request.json()
        session_id = data.get("session_id", "default")
        
        summary_text = generate_summary(session_id)
        
        # Save text output to temp file
        # Ensure 'backend' directory exists if not already
        os.makedirs("backend", exist_ok=True)
        try:
            with open("backend/temp_summary.json", "w") as f:
                json.dump({"summary": summary_text}, f, indent=2) # Wrap in dict for consistency
        except Exception as e:
            print(f"Error saving temp summary: {e}")
            
        return {"summary": summary_text} # Return as a dictionary
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/process_audio")
async def process_audio(audio: UploadFile = File(...)):
    """
    Handles Whisper transcription and Llama-based phonetic repair 
    to ensure high-quality text enters the RAG pipeline.
    """
    temp_filename = f"temp_{audio.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        with open(temp_filename, "rb") as file_obj:
            transcription = client.audio.transcriptions.create(
                file=(temp_filename, file_obj),
                model="whisper-large-v3",
                response_format="json"
            )
        
        raw_text = transcription.text
        
        # Expert prompt to clean up medical phonetic errors before processing
        repair_prompt = f"""
        The following text is a messy, phonetic transcription of a patient speaking.
        Input Text: "{raw_text}"
        Return ONLY valid JSON:
        {{
            "repaired_text": "...",
            "english_text": "..."
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are a helpful medical data processor. Output JSON only."},
                {"role": "user", "content": repair_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0
        )
        
        return json.loads(completion.choices[0].message.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@api_router.post("/analyze_prescription")
async def analyze_prescription_endpoint(image: UploadFile = File(...)):
    """
    Analyze prescription image using OCR + AI
    Extracts medicines, dosages, and other details
    """
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Analyze prescription
        result = analyze_prescription(image_bytes)
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prescription analysis error: {str(e)}")

@api_router.post("/triage")
async def triage_endpoint(request: Request):
    """
    Symptom triage endpoint - analyzes symptoms and returns risk assessment
    """
    try:
        body = await request.json()
        symptom_text = body.get("symptom_text", "")
        
        if not symptom_text:
            raise HTTPException(status_code=400, detail="symptom_text is required")
        
        # Analyze symptoms using triage service
        result = analyze_symptom(symptom_text)
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Triage error: {str(e)}")

# Mount the router AFTER all endpoints are defined
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    # Standard port for local development and demos
    uvicorn.run(app, host="0.0.0.0", port=8002)