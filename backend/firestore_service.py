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

