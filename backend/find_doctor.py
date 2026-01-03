import firebase_admin
from firebase_admin import credentials, firestore

try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except:
    db = firestore.client()

# Find doctor with doctor_id = doc_card_1
docs = db.collection('doctors').where('doctor_id', '==', 'doc_card_1').stream()

for doc in docs:
    data = doc.to_dict()
    print(f"✅ Found Dr. Vikram Singh:")
    print(f"   Firebase UID: {doc.id}")
    print(f"   Doctor ID: {data.get('doctor_id')}")
    print(f"   Name: {data.get('name')}")
