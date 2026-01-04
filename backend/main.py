from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, APIRouter
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
from firebase_auth_service import signup_user, login_user, add_profile

# Fix .env loading to be relative to this script
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path, override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    print(f"🚀 Loaded API Key: {GROQ_API_KEY[:4]}...{GROQ_API_KEY[-4:]}")
else:
    print("❌ No API Key found!")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

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
    model_config = {"extra": "ignore"}  # Ignore extra fields from frontend
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    target_language: str = "English" # Default to English
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
        "patientId": req.patientId, # Store ID for filtering
        "timestamp": int(time.time() * 1000)
    }
    MESSAGES_DB.append(user_msg_entry)
    
    # 2. Generate AI Response (RAG)
    try:
        # Convert DB history to ChatFormat for the Engine
        # CRITICAL FIX: Only include messages for THIS patient
        chat_history = []
        for m in MESSAGES_DB:
            if m.get("patientId") == req.patientId:
                role = "user" if m["sender"] == "patient" else "assistant"
                chat_history.append({"role": role, "content": m["message"]})
            
        # Call RAG (Note: we pass req.patientId as session_id)
        # We can detect language from the input if needed, defaulting to English for this endpoint
        response_data = get_medical_response(req.message, req.patientId, chat_history, target_language="English")
        
        ai_text = response_data.get("answer", "I apologize, I could not generate a response.") if isinstance(response_data, dict) else str(response_data)
        
        # If there's a structure record (Emergency/Final), we could process it here, 
        # but for the chat view we mainly need the text reply.
        
    except Exception as e:
        ai_text = f"I apologize, I encountered a technical error: {str(e)}"
        import traceback
        traceback.print_exc()

    # 3. Save AI Message
    ai_msg_entry = {
        "id": f"msg_{len(MESSAGES_DB)+1}",
        "sender": "doctor",
        "message": ai_text,
        "patientId": req.patientId, # Store ID
        "timestamp": int(time.time() * 1000) + 100 
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


@api_router.post("/translate_text")
async def translate_text(request: ChatRequest):
    """
    Detects language and translates to English for manual text inputs.
    """
    try:
        raw_text = request.message
        
        repair_prompt = f"""
        User Input: "{raw_text}"
        
        TASK:
        1. DETECT the language.
        2. TRANSLATE strictly to English for a medical database search.
        3. If it is ALREADY English, just copy it.
        
        Return ONLY valid JSON:
        {{
            "english_text": "...",   
            "detected_language": "..." // e.g. "Hindi", "English"
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "You are a universal translator. Output JSON only."},
                {"role": "user", "content": repair_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0
        )
        
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
        response = get_medical_response(request.message, request.session_id, chat_history=history_data, target_language=request.target_language)
        
        return {"reply": response}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Chat error: {str(e)}")
        # Log the specific error for debugging during your demo
        raise HTTPException(status_code=500, detail=f"RAG Reasoning Error: {str(e)}")

# Router will be mounted at the end

class SummaryRequest(BaseModel):
    session_id: str

@api_router.post("/generate_summary")
async def get_summary(request: Request):
    """
    Generates a formal medical summary for the end of the consultation.
    """
    try:
        data = await request.json()
        session_id = data.get("session_id", "default")
        target_language = data.get("target_language", "English")
        
        summary_json = generate_summary(session_id, target_language)
        
        return summary_json # Return the full JSON object directly
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
        
        TASK:
        1. Clean up the text (fix phonetic errors, grammar).
        2. Detect the language (e.g., "Telugu", "Hindi", "English").
        3. Translate to English for medical processing.
        
        Return ONLY valid JSON:
        {{
            "repaired_text": "...",
            "english_text": "...",
            "detected_language": "..."
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
async def analyze_prescription_endpoint(
    image: UploadFile = File(...)
):
    """
    Analyze prescription image using OCR + AI
    Extracts medicines, dosages, and other details
    Does NOT auto-save - user must confirm to save
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

@api_router.post("/save_prescription_record")
async def save_prescription_record_endpoint(request: Request):
    """
    Save prescription analysis to records after user confirmation
    """
    try:
        body = await request.json()
        user_id = body.get("user_id")
        profile_id = body.get("profile_id")
        prescription_data = body.get("prescription_data")
        
        print(f"📝 Save prescription request received:")
        print(f"   user_id: {user_id}")
        print(f"   profile_id: {profile_id}")
        print(f"   prescription_data keys: {prescription_data.keys() if prescription_data else None}")
        
        if not user_id or not prescription_data:
            raise HTTPException(status_code=400, detail="user_id and prescription_data are required")
        
        from firestore_service import save_prescription
        result = save_prescription(user_id, profile_id, prescription_data)
        
        print(f"📝 Save result: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Save prescription error: {str(e)}")


@api_router.post("/triage")
async def triage_endpoint(request: Request):
    """
    Symptom triage endpoint - analyzes symptoms and returns risk assessment
    """
    try:
        body = await request.json()
        # Handle multiple possible keys for robustness
        symptom_text = body.get("symptoms") or body.get("symptom") or body.get("symptom_text", "")
        
        if not symptom_text:
            raise HTTPException(status_code=400, detail="symptom_text or symptoms is required")
        
        # Analyze symptoms using triage service
        result = analyze_symptom(symptom_text)
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Triage error: {str(e)}")

# --- RECORDS MANAGEMENT ---

@api_router.post("/save_summary")
async def save_summary_endpoint(request: Request):
    """
    Save consultation summary to Firestore
    """
    try:
        body = await request.json()
        user_id = body.get("user_id")
        profile_id = body.get("profile_id")
        summary_data = body.get("summary_data")
        
        if not user_id or not summary_data:
            raise HTTPException(status_code=400, detail="user_id and summary_data are required")
        
        from firestore_service import save_summary
        result = save_summary(user_id, profile_id, summary_data)
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Save summary error: {str(e)}")

@api_router.get("/records/{user_id}")
async def get_records_endpoint(user_id: str, profile_id: str = None):
    """
    Get all records (prescriptions + summaries) for a user
    """
    try:
        from firestore_service import get_user_records
        result = get_user_records(user_id, profile_id)
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Get records error: {str(e)}")

@api_router.delete("/records/{record_id}")
async def delete_record_endpoint(record_id: str, user_id: str):
    """
    Delete a record
    """
    try:
        from firestore_service import delete_record
        result = delete_record(record_id, user_id)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Delete failed"))
        
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Delete record error: {str(e)}")

@api_router.post("/upload-medical-file")
async def upload_medical_file_endpoint(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    profile_id: str = Form(...),
    category: str = Form(...),
    notes: str = Form(None)
):
    """
    Upload a medical document (prescription, blood test, X-ray, etc.)
    Saves the file and creates a record in Firestore
    """
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = os.path.join(current_dir, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        from datetime import datetime
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{category}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(uploads_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Prepare record data
        record_data = {
            "filename": file.filename,
            "stored_filename": unique_filename,
            "file_path": file_path,
            "category": category,
            "file_type": file.content_type,
            "file_size": os.path.getsize(file_path),
            "notes": notes if notes else ""
        }
        
        # Save to Firestore
        from firestore_service import save_medical_file
        result = save_medical_file(user_id, profile_id, record_data)
        
        if not result.get("success"):
            # Clean up file if Firestore save failed
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to save record"))
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "record_id": result.get("id")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@api_router.get("/files/{filename}")
async def serve_file(filename: str):
    """
    Serve uploaded medical files
    """
    try:
        from fastapi.responses import FileResponse
        
        file_path = os.path.join(current_dir, "uploads", filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine media type based on file extension
        import mimetypes
        media_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"File serve error: {str(e)}")


# ============================================
# APPOINTMENT BOOKING ENDPOINTS
# ============================================

# Import appointment functions
from firestore_service import save_appointment, get_user_appointments, update_appointment_status
import time

# Appointment data models
class AppointmentCreate(BaseModel):
    user_id: str
    profile_id: str = None
    doctor_id: str
    doctor_uid: str = None  # Firebase UID for doctor
    doctor_name: str
    doctor_specialty: str
    doctor_location: dict
    appointment_date: str  # ISO format YYYY-MM-DD
    appointment_time: str  # 24hr format HH:MM
    consultation_fee: int
    is_urgent: bool = False

class AppointmentStatusUpdate(BaseModel):
    status: str  # confirmed, cancelled, completed

@api_router.post("/appointments/book")
async def book_appointment(appointment: AppointmentCreate):
    """
    Book a new appointment
    """
    try:
        print(f"📅 Booking appointment request received")
        print(f"   Doctor: {appointment.doctor_name}")
        print(f"   Doctor ID: {appointment.doctor_id}")
        print(f"   Doctor UID: {appointment.doctor_uid}")
        print(f"   Date: {appointment.appointment_date}")
        print(f"   Time: {appointment.appointment_time}")
        print(f"   Urgent: {appointment.is_urgent}")
        
        # Generate confirmation number
        prefix = "URG" if appointment.is_urgent else "CONF"
        confirmation_number = f"{prefix}-{int(time.time() * 1000) % 100000000}"
        
        # Validate doctor_uid is present
        if not appointment.doctor_uid:
            print(f"⚠️ WARNING: doctor_uid is missing for appointment!")
            print(f"   This appointment will not appear on doctor dashboard")
            # Don't fail the request, but log it prominently
        
        # Prepare appointment data
        appointment_data = {
            'user_id': appointment.user_id,
            'profile_id': appointment.profile_id,
            'doctor_id': appointment.doctor_id,
            'doctor_uid': appointment.doctor_uid,  # Include Firebase UID
            'doctor_name': appointment.doctor_name,
            'doctor_specialty': appointment.doctor_specialty,
            'doctor_location': appointment.doctor_location,
            'appointment_date': appointment.appointment_date,
            'appointment_time': appointment.appointment_time,
            'consultation_fee': appointment.consultation_fee,
            'status': 'confirmed',
            'is_urgent': appointment.is_urgent,
            'confirmation_number': confirmation_number
        }
        
        # Save to Firestore
        result = save_appointment(appointment_data)
        
        if result.get('success'):
            print(f"✅ Appointment booked successfully: {confirmation_number}")
            return {
                'success': True,
                'appointment_id': result['id'],
                'confirmation_number': confirmation_number,
                **result['data']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to save appointment'))
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error booking appointment: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/appointments/user/{user_id}")
async def get_appointments(user_id: str, profile_id: str = None):
    """
    Get all appointments for a user
    Query params:
    - profile_id: Optional, filter by specific profile
    """
    try:
        print(f"📋 Fetching appointments for user: {user_id}")
        if profile_id:
            print(f"   Profile: {profile_id}")
        
        result = get_user_appointments(user_id, profile_id)
        
        if result.get('success'):
            print(f"✅ Found {len(result['upcoming'])} upcoming, {len(result['past'])} past appointments")
            return {
                'success': True,
                'upcoming': result['upcoming'],
                'past': result['past']
            }
        else:
            # Return empty arrays if Firestore not available
            print("⚠️ Firestore not available, returning empty")
            return {
                'success': True,
                'upcoming': [],
                'past': []
            }
            
    except Exception as e:
        print(f"❌ Error fetching appointments: {e}")
        import traceback
        traceback.print_exc()
        # Return empty arrays on error (graceful degradation)
        return {
            'success': True,
            'upcoming': [],
            'past': []
        }


@api_router.put("/appointments/{appointment_id}/status")
async def update_status(appointment_id: str, status_update: AppointmentStatusUpdate):
    """
    Update appointment status (cancel, complete, etc.)
    """
    try:
        print(f"🔄 Updating appointment {appointment_id} to {status_update.status}")
        
        result = update_appointment_status(appointment_id, status_update.status)
        
        if result.get('success'):
            print(f"✅ Appointment status updated")
            return {'success': True, 'message': 'Status updated successfully'}
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to update status'))
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# DOCTOR-SIDE ENDPOINTS
# ============================================

from firestore_service import get_doctor_appointments, get_incoming_records, update_appointment_with_notes, db

@api_router.get("/doctor/uid/{doctor_id}")
async def get_doctor_uid_endpoint(doctor_id: str):
    """
    Get Firebase UID for a doctor by their doctor_id
    """
    try:
        if not db:
            return {"success": False, "uid": None}
        
        # Query for doctor by doctor_id
        docs = db.collection('doctors').where('doctor_id', '==', doctor_id).stream()
        
        for doc in docs:
            return {"success": True, "uid": doc.id, "doctor_id": doctor_id}
        
        return {"success": False, "uid": None, "error": "Doctor not found"}
    except Exception as e:
        print(f"❌ Error fetching doctor UID: {e}")
        return {"success": False, "uid": None, "error": str(e)}

@api_router.get("/doctor/appointments/{doctor_id}")
async def get_doctor_appts(doctor_id: str):
    """
    Get all appointments for a specific doctor
    """
    try:
        print(f"📋 Fetching appointments for doctor: {doctor_id}")
        
        result = get_doctor_appointments(doctor_id)
        
        if result.get('success'):
            print(f"✅ Returning {len(result['appointments'])} appointments")
            return {
                'success': True,
                'appointments': result['appointments']
            }
        else:
            # Return empty array if Firestore not available
            print("⚠️ Firestore not available, returning empty")
            return {
                'success': True,
                'appointments': []
            }
            
    except Exception as e:
        print(f"❌ Error fetching doctor appointments: {e}")
        # Return empty array on error (graceful degradation)
        return {
            'success': True,
            'appointments': []
        }


@api_router.get("/doctor/incoming_records")
async def get_incoming_recs():
    """
    Get all incoming medical records for doctor review
    """
    try:
        print(f"📋 Fetching incoming records")
        
        result = get_incoming_records()
        
        if result.get('success'):
            print(f"✅ Returning {len(result['records'])} records")
            return {
                'success': True,
                'records': result['records']
            }
        else:
            # Return empty array if Firestore not available
            print("⚠️ Firestore not available, returning empty")
            return {
                'success': True,
                'records': []
            }
            
    except Exception as e:
        print(f"❌ Error fetching records: {e}")
        # Return empty array on error (graceful degradation)
        return {
            'success': True,
            'records': []
        }


@api_router.patch("/doctor/appointments/{appointment_id}")
async def update_doctor_appt(appointment_id: str, update_data: dict):
    """
    Update appointment status and add notes (for doctor completing appointments)
    """
    try:
        print(f"🔄 Doctor updating appointment {appointment_id}")
        
        status = update_data.get('status', 'completed')
        notes = update_data.get('notes', '')
        
        result = update_appointment_with_notes(appointment_id, status, notes)
        
        if result.get('success'):
            print(f"✅ Appointment updated")
            return {'success': True, 'message': 'Appointment updated successfully'}
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to update'))
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Mount the router AFTER all endpoints are defined
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    # Standard port for local development and demos
    uvicorn.run(app, host="0.0.0.0", port=8002)