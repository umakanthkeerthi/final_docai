import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
try:
    firebase_admin.get_app()
except:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Get the latest appointment
appointments = db.collection('appointments').order_by('created_at', direction=firestore.Query.DESCENDING).limit(1).stream()

for apt in appointments:
    data = apt.to_dict()
    print(f"\n📋 Latest Appointment:")
    print(f"   ID: {apt.id}")
    print(f"   Doctor ID: {data.get('doctor_id')}")
    print(f"   Doctor UID: {data.get('doctor_uid', 'MISSING ❌')}")
    print(f"   Doctor Name: {data.get('doctor_name')}")
    print(f"   Patient ID: {data.get('user_id')}")
    print(f"   Date: {data.get('appointment_date')}")
    print(f"   Time: {data.get('appointment_time')}")
    print(f"   Status: {data.get('status')}")
    print(f"   Confirmation: {data.get('confirmation_number')}")
