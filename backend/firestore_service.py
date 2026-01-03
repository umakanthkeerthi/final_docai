"""
Firestore Data Service
Handles saving and retrieving user data from Firestore
"""

from firebase_config import get_db
from datetime import datetime
import uuid

db = get_db()

def save_prescription(user_id, profile_id, prescription_data):
    """
    Save prescription analysis to Firestore
    """
    try:
        if not db:
            print("⚠️ Firestore not available, skipping save")
            return {"success": False, "error": "Firestore not configured"}
        
        prescription_id = str(uuid.uuid4())
        
        # Ensure profile_id is string for consistent querying
        profile_id_str = str(profile_id) if profile_id else None
        
        print(f"💾 Saving prescription:")
        print(f"   ID: {prescription_id}")
        print(f"   user_id: {user_id} (type: {type(user_id)})")
        print(f"   profile_id: {profile_id_str} (type: {type(profile_id_str)})")
        
        prescription_doc = {
            "id": prescription_id,
            "user_id": str(user_id),
            "profile_id": profile_id_str,
            "type": "prescription",
            "data": prescription_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('records').document(prescription_id).set(prescription_doc)
        
        print(f"✅ Prescription saved: {prescription_id}")
        return {"success": True, "id": prescription_id}
        
    except Exception as e:
        print(f"❌ Error saving prescription: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


def save_summary(user_id, profile_id, summary_data):
    """
    Save consultation summary to Firestore
    """
    try:
        if not db:
            print("⚠️ Firestore not available, skipping save")
            return {"success": False, "error": "Firestore not configured"}
        
        summary_id = str(uuid.uuid4())
        
        summary_doc = {
            "id": summary_id,
            "user_id": user_id,
            "profile_id": profile_id,
            "type": "summary",
            "data": summary_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('records').document(summary_id).set(summary_doc)
        
        print(f"✅ Summary saved: {summary_id}")
        return {"success": True, "id": summary_id}
        
    except Exception as e:
        print(f"❌ Error saving summary: {e}")
        return {"success": False, "error": str(e)}


def get_user_records(user_id, profile_id=None):
    """
    Get all records (prescriptions + summaries) for a user/profile
    """
    try:
        if not db:
            print("⚠️ Firestore not available")
            return {"success": False, "records": []}
        
        # Convert to strings for consistent querying
        user_id_str = str(user_id)
        profile_id_str = str(profile_id) if profile_id else None
        
        print(f"🔍 Querying records: user_id={user_id_str}, profile_id={profile_id_str}")
        
        # Query records
        query = db.collection('records').where('user_id', '==', user_id_str)
        
        if profile_id_str:
            query = query.where('profile_id', '==', profile_id_str)
        
        # Fetch all records (without ordering to avoid composite index requirement)
        records = []
        for doc in query.stream():
            record_data = doc.to_dict()
            records.append(record_data)
            print(f"   📄 Found: {record_data.get('id')} - {record_data.get('type')}")
        
        # Sort in memory by created_at descending
        records.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        print(f"✅ Retrieved {len(records)} records for user {user_id_str}")
        return {"success": True, "records": records}
        
    except Exception as e:
        print(f"❌ Error retrieving records: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "records": [], "error": str(e)}


def delete_record(record_id, user_id):
    """
    Delete a record (with user verification)
    """
    try:
        if not db:
            print("⚠️ Firestore not available")
            return {"success": False, "error": "Firestore not configured"}
        
        # Verify ownership
        doc_ref = db.collection('records').document(record_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return {"success": False, "error": "Record not found"}
        
        record_data = doc.to_dict()
        if record_data.get('user_id') != user_id:
            return {"success": False, "error": "Unauthorized"}
        
        # Delete
        doc_ref.delete()
        
        print(f"✅ Record deleted: {record_id}")
        return {"success": True}
        
    except Exception as e:
        print(f"❌ Error deleting record: {e}")
        return {"success": False, "error": str(e)}


def save_medical_file(user_id, profile_id, file_data):
    """
    Save medical file record to Firestore
    """
    try:
        if not db:
            print("⚠️ Firestore not available, skipping save")
            return {"success": False, "error": "Firestore not configured"}
        
        record_id = str(uuid.uuid4())
        
        record_doc = {
            "id": record_id,
            "user_id": user_id,
            "profile_id": profile_id,
            "type": "medical_file",
            "data": file_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('records').document(record_id).set(record_doc)
        
        print(f"✅ Medical file record saved: {record_id}")
        return {"success": True, "id": record_id}
        
    except Exception as e:
        print(f"❌ Error saving medical file: {e}")
        return {"success": False, "error": str(e)}


# ============================================
# APPOINTMENT BOOKING FUNCTIONS
# ============================================

def save_appointment(appointment_data):
    """
    Save appointment booking to Firestore
    """
    try:
        if not db:
            print("⚠️ Firestore not available, skipping save")
            return {"success": False, "error": "Firestore not configured"}
        
        appointment_id = str(uuid.uuid4())
        
        print(f"💾 Saving appointment:")
        print(f"   ID: {appointment_id}")
        print(f"   user_id: {appointment_data.get('user_id')}")
        print(f"   doctor: {appointment_data.get('doctor_name')}")
        print(f"   date: {appointment_data.get('appointment_date')}")
        print(f"   time: {appointment_data.get('appointment_time')}")
        
        appointment_doc = {
            "id": appointment_id,
            "user_id": str(appointment_data.get('user_id')),
            "profile_id": str(appointment_data.get('profile_id')) if appointment_data.get('profile_id') else None,
            "doctor_id": appointment_data.get('doctor_id'),
            "doctor_name": appointment_data.get('doctor_name'),
            "doctor_specialty": appointment_data.get('doctor_specialty'),
            "doctor_location": appointment_data.get('doctor_location'),
            "appointment_date": appointment_data.get('appointment_date'),
            "appointment_time": appointment_data.get('appointment_time'),
            "consultation_fee": appointment_data.get('consultation_fee'),
            "status": appointment_data.get('status', 'confirmed'),
            "is_urgent": appointment_data.get('is_urgent', False),
            "confirmation_number": appointment_data.get('confirmation_number'),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('appointments').document(appointment_id).set(appointment_doc)
        
        print(f"✅ Appointment saved: {appointment_id}")
        return {"success": True, "id": appointment_id, "data": appointment_doc}
        
    except Exception as e:
        print(f"❌ Error saving appointment: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


def get_user_appointments(user_id, profile_id=None):
    """
    Get all appointments for a user
    """
    try:
        if not db:
            print("⚠️ Firestore not available")
            return {"success": False, "error": "Firestore not configured"}
        
        print(f"📋 Fetching appointments for user: {user_id}, profile: {profile_id}")
        
        # Query appointments
        query = db.collection('appointments').where('user_id', '==', str(user_id))
        
        if profile_id:
            query = query.where('profile_id', '==', str(profile_id))
        
        # Get documents
        docs = query.stream()
        
        appointments = []
        for doc in docs:
            data = doc.to_dict()
            appointments.append(data)
        
        print(f"✅ Found {len(appointments)} appointments")
        
        # Separate into upcoming and past
        today = datetime.now().date()
        upcoming = []
        past = []
        
        for apt in appointments:
            try:
                apt_date = datetime.fromisoformat(apt['appointment_date']).date()
                if apt_date >= today and apt['status'] == 'confirmed':
                    upcoming.append(apt)
                else:
                    past.append(apt)
            except:
                # If date parsing fails, add to past
                past.append(apt)
        
        # Sort upcoming by date (earliest first)
        upcoming.sort(key=lambda x: (x['appointment_date'], x['appointment_time']))
        
        # Sort past by date (most recent first)
        past.sort(key=lambda x: (x['appointment_date'], x['appointment_time']), reverse=True)
        
        return {
            "success": True,
            "upcoming": upcoming,
            "past": past
        }
        
    except Exception as e:
        print(f"❌ Error fetching appointments: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


def update_appointment_status(appointment_id, status):
    """
    Update appointment status (e.g., cancel, complete)
    """
    try:
        if not db:
            print("⚠️ Firestore not available")
            return {"success": False, "error": "Firestore not configured"}
        
        print(f"🔄 Updating appointment {appointment_id} to status: {status}")
        
        # Update document
        db.collection('appointments').document(appointment_id).update({
            'status': status,
            'updated_at': datetime.now().isoformat()
        })
        
        print(f"✅ Appointment status updated")
        return {"success": True}
        
    except Exception as e:
        print(f"❌ Error updating appointment: {e}")
        return {"success": False, "error": str(e)}
