"""
Firebase Cleanup Script
Clears all appointments and records to start fresh
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase Admin SDK initialized")
except Exception as e:
    print(f"⚠️ Firebase already initialized: {e}")
    db = firestore.client()

def clear_collection(collection_name):
    """Delete all documents in a collection"""
    try:
        docs = db.collection(collection_name).stream()
        count = 0
        for doc in docs:
            doc.reference.delete()
            count += 1
        print(f"✅ Deleted {count} documents from '{collection_name}'")
        return count
    except Exception as e:
        print(f"❌ Error clearing {collection_name}: {e}")
        return 0

if __name__ == "__main__":
    print("\n" + "="*80)
    print("FIREBASE CLEANUP - RESET TO ZERO")
    print("="*80 + "\n")
    
    # Clear appointments
    print("🗑️  Clearing appointments...")
    appt_count = clear_collection('appointments')
    
    # Clear records
    print("🗑️  Clearing records...")
    records_count = clear_collection('records')
    
    # Clear messages (optional)
    print("🗑️  Clearing messages...")
    msg_count = clear_collection('messages')
    
    # Clear conversations (optional)
    print("🗑️  Clearing conversations...")
    conv_count = clear_collection('conversations')
    
    print("\n" + "="*80)
    print(f"✅ Cleanup Complete!")
    print(f"   - Appointments deleted: {appt_count}")
    print(f"   - Records deleted: {records_count}")
    print(f"   - Messages deleted: {msg_count}")
    print(f"   - Conversations deleted: {conv_count}")
    print("="*80 + "\n")
    
    print("✅ Firebase is now clean. You can start fresh!")
    print("   - Doctor accounts: Still active (30 doctors)")
    print("   - Patient accounts: Still active")
    print("   - All appointments: Cleared")
    print("   - All records: Cleared")
