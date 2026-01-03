"""
Check Firebase Appointments
Shows what's actually in the appointments collection
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized")
except Exception as e:
    print(f"⚠️ Already initialized: {e}")
    db = firestore.client()

print("\n" + "="*80)
print("CHECKING APPOINTMENTS IN FIREBASE")
print("="*80 + "\n")

# Get all appointments
appointments = db.collection('appointments').stream()

count = 0
for appt in appointments:
    count += 1
    data = appt.to_dict()
    print(f"\n📋 Appointment {count}:")
    print(f"   ID: {appt.id}")
    print(f"   Doctor ID: {data.get('doctor_id', 'MISSING')}")
    print(f"   Doctor UID: {data.get('doctor_uid', 'MISSING ❌')}")
    print(f"   Doctor Name: {data.get('doctor_name', 'MISSING')}")
    print(f"   Patient ID: {data.get('user_id', 'MISSING')}")
    print(f"   Date: {data.get('appointment_date', 'MISSING')}")
    print(f"   Time: {data.get('appointment_time', 'MISSING')}")
    print(f"   Status: {data.get('status', 'MISSING')}")
    print(f"   Is Urgent: {data.get('is_urgent', 'MISSING')}")

if count == 0:
    print("❌ No appointments found in Firebase!")
else:
    print(f"\n✅ Total appointments: {count}")

print("\n" + "="*80)
print("CHECKING DOCTORS IN FIREBASE")
print("="*80 + "\n")

# Get all doctors
doctors = db.collection('doctors').stream()

doc_count = 0
for doc in doctors:
    doc_count += 1
    data = doc.to_dict()
    if doc_count <= 3:  # Show first 3 doctors
        print(f"\n👨‍⚕️ Doctor {doc_count}:")
        print(f"   UID: {doc.id}")
        print(f"   Doctor ID: {data.get('doctor_id', 'MISSING')}")
        print(f"   Name: {data.get('name', 'MISSING')}")
        print(f"   Email: {data.get('email', 'MISSING')}")
        print(f"   Specialty: {data.get('specialty', 'MISSING')}")

print(f"\n✅ Total doctors: {doc_count}")
