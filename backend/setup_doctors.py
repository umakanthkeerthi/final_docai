"""
Firebase Doctor Account Setup Script
Creates Firebase Authentication accounts and Firestore profiles for all 30 doctors
"""

import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime
import json

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase Admin SDK initialized")
except Exception as e:
    print(f"⚠️ Firebase already initialized or error: {e}")
    db = firestore.client()

# Doctor data from DOCTORS_DATABASE
DOCTORS_DATA = [
    # PRIMARY CARE
    {
        "id": "doc_pc_1",
        "name": "Dr. Rajesh Sharma",
        "email": "rajesh.sharma@docai.com",
        "specialty": "Primary Care",
        "qualification": "MBBS, MD (General Medicine)",
        "experience": "18 years",
        "rating": 4.7,
        "reviews": 342,
        "languages": ["Hindi", "English"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 600,
        "phone": "+91-9876543001"
    },
    {
        "id": "doc_pc_2",
        "name": "Dr. Priya Verma",
        "email": "priya.verma@docai.com",
        "specialty": "Primary Care",
        "qualification": "MBBS, MD (Internal Medicine)",
        "experience": "12 years",
        "rating": 4.8,
        "reviews": 289,
        "languages": ["Hindi", "English", "Rajasthani"],
        "hospital": "Manipal Hospital",
        "address": "Sector 5, Vidyadhar Nagar, Jaipur",
        "area": "Vidyadhar Nagar",
        "distance": "4.1 km",
        "consultation_fee": 550,
        "phone": "+91-9876543002"
    },
    {
        "id": "doc_pc_3",
        "name": "Dr. Amit Gupta",
        "email": "amit.gupta@docai.com",
        "specialty": "Primary Care",
        "qualification": "MBBS, DNB (Family Medicine)",
        "experience": "15 years",
        "rating": 4.6,
        "reviews": 412,
        "languages": ["Hindi", "English"],
        "hospital": "Eternal Heart Care Centre",
        "address": "Jagatpura Road, Jagatpura, Jaipur",
        "area": "Jagatpura",
        "distance": "5.8 km",
        "consultation_fee": 500,
        "phone": "+91-9876543003"
    },
    
    # CARDIOLOGY
    {
        "id": "doc_card_1",
        "name": "Dr. Vikram Singh",
        "email": "vikram.singh@docai.com",
        "specialty": "Cardiology",
        "qualification": "MBBS, MD, DM (Cardiology)",
        "experience": "20 years",
        "rating": 4.9,
        "reviews": 567,
        "languages": ["Hindi", "English"],
        "hospital": "Narayana Multispeciality Hospital",
        "address": "Sector 28, Pratap Nagar, Jaipur",
        "area": "Pratap Nagar",
        "distance": "3.2 km",
        "consultation_fee": 1200,
        "phone": "+91-9876543004"
    },
    {
        "id": "doc_card_2",
        "name": "Dr. Sunita Agarwal",
        "email": "sunita.agarwal@docai.com",
        "specialty": "Cardiology",
        "qualification": "MBBS, MD, DM (Cardiology)",
        "experience": "16 years",
        "rating": 4.8,
        "reviews": 423,
        "languages": ["Hindi", "English"],
        "hospital": "SMS Hospital",
        "address": "JLN Marg, Jaipur",
        "area": "JLN Marg",
        "distance": "1.8 km",
        "consultation_fee": 800,
        "phone": "+91-9876543005"
    },
    {
        "id": "doc_card_3",
        "name": "Dr. Arjun Mehta",
        "email": "arjun.mehta@docai.com",
        "specialty": "Cardiology",
        "qualification": "MBBS, MD, DM (Interventional Cardiology)",
        "experience": "14 years",
        "rating": 4.7,
        "reviews": 389,
        "languages": ["Hindi", "English", "Gujarati"],
        "hospital": "CK Birla Hospital",
        "address": "Tonk Road, Jaipur",
        "area": "Tonk Road",
        "distance": "6.5 km",
        "consultation_fee": 1000,
        "phone": "+91-9876543006"
    },
    
    # DERMATOLOGY
    {
        "id": "doc_derm_1",
        "name": "Dr. Neha Jain",
        "email": "neha.jain@docai.com",
        "specialty": "Dermatology",
        "qualification": "MBBS, MD (Dermatology)",
        "experience": "10 years",
        "rating": 4.8,
        "reviews": 512,
        "languages": ["Hindi", "English"],
        "hospital": "Skin & You Clinic",
        "address": "C-Scheme, Jaipur",
        "area": "C-Scheme",
        "distance": "2.7 km",
        "consultation_fee": 700,
        "phone": "+91-9876543007"
    },
    {
        "id": "doc_derm_2",
        "name": "Dr. Karan Malhotra",
        "email": "karan.malhotra@docai.com",
        "specialty": "Dermatology",
        "qualification": "MBBS, MD, DNB (Dermatology)",
        "experience": "13 years",
        "rating": 4.7,
        "reviews": 445,
        "languages": ["Hindi", "English", "Punjabi"],
        "hospital": "Apex Hospital",
        "address": "Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "3.5 km",
        "consultation_fee": 650,
        "phone": "+91-9876543008"
    },
    {
        "id": "doc_derm_3",
        "name": "Dr. Anjali Saxena",
        "email": "anjali.saxena@docai.com",
        "specialty": "Dermatology",
        "qualification": "MBBS, MD (Dermatology, Venereology & Leprosy)",
        "experience": "11 years",
        "rating": 4.9,
        "reviews": 623,
        "languages": ["Hindi", "English"],
        "hospital": "Jaipur Skin Hospital",
        "address": "Vaishali Nagar, Jaipur",
        "area": "Vaishali Nagar",
        "distance": "4.9 km",
        "consultation_fee": 750,
        "phone": "+91-9876543009"
    },
    
    # ORTHOPEDICS
    {
        "id": "doc_ortho_1",
        "name": "Dr. Rahul Khanna",
        "email": "rahul.khanna@docai.com",
        "specialty": "Orthopedics",
        "qualification": "MBBS, MS (Orthopedics)",
        "experience": "17 years",
        "rating": 4.8,
        "reviews": 478,
        "languages": ["Hindi", "English"],
        "hospital": "Jaipur Joint Replacement Centre",
        "address": "Tonk Road, Jaipur",
        "area": "Tonk Road",
        "distance": "5.2 km",
        "consultation_fee": 900,
        "phone": "+91-9876543010"
    },
    {
        "id": "doc_ortho_2",
        "name": "Dr. Meera Reddy",
        "email": "meera.reddy@docai.com",
        "specialty": "Orthopedics",
        "qualification": "MBBS, MS, DNB (Orthopedics)",
        "experience": "14 years",
        "rating": 4.7,
        "reviews": 392,
        "languages": ["Hindi", "English", "Telugu"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 850,
        "phone": "+91-9876543011"
    },
    {
        "id": "doc_ortho_3",
        "name": "Dr. Sandeep Patel",
        "email": "sandeep.patel@docai.com",
        "specialty": "Orthopedics",
        "qualification": "MBBS, MS (Orthopedics), Fellowship in Sports Medicine",
        "experience": "12 years",
        "rating": 4.6,
        "reviews": 356,
        "languages": ["Hindi", "English"],
        "hospital": "Manipal Hospital",
        "address": "Sector 5, Vidyadhar Nagar, Jaipur",
        "area": "Vidyadhar Nagar",
        "distance": "4.1 km",
        "consultation_fee": 800,
        "phone": "+91-9876543012"
    },
    
    # PEDIATRICS
    {
        "id": "doc_ped_1",
        "name": "Dr. Kavita Sharma",
        "email": "kavita.sharma@docai.com",
        "specialty": "Pediatrics",
        "qualification": "MBBS, MD (Pediatrics)",
        "experience": "16 years",
        "rating": 4.9,
        "reviews": 689,
        "languages": ["Hindi", "English"],
        "hospital": "Rainbow Children's Hospital",
        "address": "Vaishali Nagar, Jaipur",
        "area": "Vaishali Nagar",
        "distance": "4.9 km",
        "consultation_fee": 600,
        "phone": "+91-9876543013"
    },
    {
        "id": "doc_ped_2",
        "name": "Dr. Rohit Bansal",
        "email": "rohit.bansal@docai.com",
        "specialty": "Pediatrics",
        "qualification": "MBBS, MD, DNB (Pediatrics)",
        "experience": "13 years",
        "rating": 4.8,
        "reviews": 534,
        "languages": ["Hindi", "English"],
        "hospital": "Narayana Multispeciality Hospital",
        "address": "Sector 28, Pratap Nagar, Jaipur",
        "area": "Pratap Nagar",
        "distance": "3.2 km",
        "consultation_fee": 550,
        "phone": "+91-9876543014"
    },
    {
        "id": "doc_ped_3",
        "name": "Dr. Pooja Agarwal",
        "email": "pooja.agarwal@docai.com",
        "specialty": "Pediatrics",
        "qualification": "MBBS, MD (Pediatrics), Fellowship in Neonatology",
        "experience": "11 years",
        "rating": 4.7,
        "reviews": 467,
        "languages": ["Hindi", "English"],
        "hospital": "CK Birla Hospital",
        "address": "Tonk Road, Jaipur",
        "area": "Tonk Road",
        "distance": "6.5 km",
        "consultation_fee": 650,
        "phone": "+91-9876543015"
    },
    
    # GYNECOLOGY
    {
        "id": "doc_gyn_1",
        "name": "Dr. Nisha Kapoor",
        "email": "nisha.kapoor@docai.com",
        "specialty": "Gynecology",
        "qualification": "MBBS, MS (Obstetrics & Gynecology)",
        "experience": "19 years",
        "rating": 4.9,
        "reviews": 712,
        "languages": ["Hindi", "English"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 800,
        "phone": "+91-9876543016"
    },
    {
        "id": "doc_gyn_2",
        "name": "Dr. Rekha Singhania",
        "email": "rekha.singhania@docai.com",
        "specialty": "Gynecology",
        "qualification": "MBBS, MD (Obstetrics & Gynecology), FICOG",
        "experience": "15 years",
        "rating": 4.8,
        "reviews": 598,
        "languages": ["Hindi", "English", "Marwari"],
        "hospital": "Apex Hospital",
        "address": "Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "3.5 km",
        "consultation_fee": 750,
        "phone": "+91-9876543017"
    },
    {
        "id": "doc_gyn_3",
        "name": "Dr. Simran Bhatia",
        "email": "simran.bhatia@docai.com",
        "specialty": "Gynecology",
        "qualification": "MBBS, MS (Obstetrics & Gynecology), DNB",
        "experience": "12 years",
        "rating": 4.7,
        "reviews": 523,
        "languages": ["Hindi", "English", "Punjabi"],
        "hospital": "Manipal Hospital",
        "address": "Sector 5, Vidyadhar Nagar, Jaipur",
        "area": "Vidyadhar Nagar",
        "distance": "4.1 km",
        "consultation_fee": 700,
        "phone": "+91-9876543018"
    },
    
    # ENT
    {
        "id": "doc_ent_1",
        "name": "Dr. Anil Kumar",
        "email": "anil.kumar@docai.com",
        "specialty": "ENT",
        "qualification": "MBBS, MS (ENT)",
        "experience": "18 years",
        "rating": 4.8,
        "reviews": 456,
        "languages": ["Hindi", "English"],
        "hospital": "SMS Hospital",
        "address": "JLN Marg, Jaipur",
        "area": "JLN Marg",
        "distance": "1.8 km",
        "consultation_fee": 600,
        "phone": "+91-9876543019"
    },
    {
        "id": "doc_ent_2",
        "name": "Dr. Shalini Gupta",
        "email": "shalini.gupta@docai.com",
        "specialty": "ENT",
        "qualification": "MBBS, MS, DNB (ENT)",
        "experience": "14 years",
        "rating": 4.7,
        "reviews": 389,
        "languages": ["Hindi", "English"],
        "hospital": "Narayana Multispeciality Hospital",
        "address": "Sector 28, Pratap Nagar, Jaipur",
        "area": "Pratap Nagar",
        "distance": "3.2 km",
        "consultation_fee": 650,
        "phone": "+91-9876543020"
    },
    {
        "id": "doc_ent_3",
        "name": "Dr. Manish Joshi",
        "email": "manish.joshi@docai.com",
        "specialty": "ENT",
        "qualification": "MBBS, MS (ENT), Fellowship in Rhinology",
        "experience": "11 years",
        "rating": 4.6,
        "reviews": 334,
        "languages": ["Hindi", "English"],
        "hospital": "CK Birla Hospital",
        "address": "Tonk Road, Jaipur",
        "area": "Tonk Road",
        "distance": "6.5 km",
        "consultation_fee": 700,
        "phone": "+91-9876543021"
    },
    
    # OPHTHALMOLOGY
    {
        "id": "doc_oph_1",
        "name": "Dr. Deepak Verma",
        "email": "deepak.verma@docai.com",
        "specialty": "Ophthalmology",
        "qualification": "MBBS, MS (Ophthalmology)",
        "experience": "16 years",
        "rating": 4.9,
        "reviews": 623,
        "languages": ["Hindi", "English"],
        "hospital": "Jaipur Eye Hospital",
        "address": "C-Scheme, Jaipur",
        "area": "C-Scheme",
        "distance": "2.7 km",
        "consultation_fee": 700,
        "phone": "+91-9876543022"
    },
    {
        "id": "doc_oph_2",
        "name": "Dr. Ritu Malhotra",
        "email": "ritu.malhotra@docai.com",
        "specialty": "Ophthalmology",
        "qualification": "MBBS, MS, DNB (Ophthalmology)",
        "experience": "13 years",
        "rating": 4.8,
        "reviews": 512,
        "languages": ["Hindi", "English", "Punjabi"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 750,
        "phone": "+91-9876543023"
    },
    {
        "id": "doc_oph_3",
        "name": "Dr. Suresh Reddy",
        "email": "suresh.reddy@docai.com",
        "specialty": "Ophthalmology",
        "qualification": "MBBS, MS (Ophthalmology), Fellowship in Retina",
        "experience": "10 years",
        "rating": 4.7,
        "reviews": 445,
        "languages": ["Hindi", "English", "Telugu"],
        "hospital": "Manipal Hospital",
        "address": "Sector 5, Vidyadhar Nagar, Jaipur",
        "area": "Vidyadhar Nagar",
        "distance": "4.1 km",
        "consultation_fee": 650,
        "phone": "+91-9876543024"
    },
    
    # GASTROENTEROLOGY
    {
        "id": "doc_gastro_1",
        "name": "Dr. Ashok Jain",
        "email": "ashok.jain@docai.com",
        "specialty": "Gastroenterology",
        "qualification": "MBBS, MD, DM (Gastroenterology)",
        "experience": "17 years",
        "rating": 4.8,
        "reviews": 478,
        "languages": ["Hindi", "English"],
        "hospital": "Narayana Multispeciality Hospital",
        "address": "Sector 28, Pratap Nagar, Jaipur",
        "area": "Pratap Nagar",
        "distance": "3.2 km",
        "consultation_fee": 1000,
        "phone": "+91-9876543025"
    },
    {
        "id": "doc_gastro_2",
        "name": "Dr. Vandana Sharma",
        "email": "vandana.sharma@docai.com",
        "specialty": "Gastroenterology",
        "qualification": "MBBS, MD, DM (Gastroenterology & Hepatology)",
        "experience": "14 years",
        "rating": 4.7,
        "reviews": 392,
        "languages": ["Hindi", "English"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 950,
        "phone": "+91-9876543026"
    },
    {
        "id": "doc_gastro_3",
        "name": "Dr. Ramesh Patel",
        "email": "ramesh.patel@docai.com",
        "specialty": "Gastroenterology",
        "qualification": "MBBS, MD, DM (Gastroenterology)",
        "experience": "12 years",
        "rating": 4.6,
        "reviews": 356,
        "languages": ["Hindi", "English", "Gujarati"],
        "hospital": "CK Birla Hospital",
        "address": "Tonk Road, Jaipur",
        "area": "Tonk Road",
        "distance": "6.5 km",
        "consultation_fee": 900,
        "phone": "+91-9876543027"
    },
    
    # NEUROLOGY
    {
        "id": "doc_neuro_1",
        "name": "Dr. Sanjay Khanna",
        "email": "sanjay.khanna@docai.com",
        "specialty": "Neurology",
        "qualification": "MBBS, MD, DM (Neurology)",
        "experience": "19 years",
        "rating": 4.9,
        "reviews": 567,
        "languages": ["Hindi", "English"],
        "hospital": "Fortis Escorts Hospital",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
        "area": "Malviya Nagar",
        "distance": "2.3 km",
        "consultation_fee": 1200,
        "phone": "+91-9876543028"
    },
    {
        "id": "doc_neuro_2",
        "name": "Dr. Anita Desai",
        "email": "anita.desai@docai.com",
        "specialty": "Neurology",
        "qualification": "MBBS, MD, DM (Neurology & Stroke Medicine)",
        "experience": "15 years",
        "rating": 4.8,
        "reviews": 489,
        "languages": ["Hindi", "English", "Marathi"],
        "hospital": "Narayana Multispeciality Hospital",
        "address": "Sector 28, Pratap Nagar, Jaipur",
        "area": "Pratap Nagar",
        "distance": "3.2 km",
        "consultation_fee": 1100,
        "phone": "+91-9876543029"
    },
    {
        "id": "doc_neuro_3",
        "name": "Dr. Vikrant Singh",
        "email": "vikrant.singh@docai.com",
        "specialty": "Neurology",
        "qualification": "MBBS, MD, DM (Neurology), Fellowship in Epilepsy",
        "experience": "13 years",
        "rating": 4.7,
        "reviews": 423,
        "languages": ["Hindi", "English"],
        "hospital": "Manipal Hospital",
        "address": "Sector 5, Vidyadhar Nagar, Jaipur",
        "area": "Vidyadhar Nagar",
        "distance": "4.1 km",
        "consultation_fee": 1050,
        "phone": "+91-9876543030"
    }
]

# Default password for all doctors
DEFAULT_PASSWORD = "DocAI@2026"

def create_doctor_accounts():
    """Create Firebase Auth accounts and Firestore profiles for all doctors"""
    
    created_accounts = []
    failed_accounts = []
    
    print(f"\n🚀 Starting creation of {len(DOCTORS_DATA)} doctor accounts...\n")
    
    for i, doctor in enumerate(DOCTORS_DATA, 1):
        try:
            # Create Firebase Auth account
            user = auth.create_user(
                email=doctor['email'],
                password=DEFAULT_PASSWORD,
                display_name=doctor['name']
            )
            
            print(f"✅ [{i}/30] Created Auth: {doctor['name']} ({doctor['email']})")
            
            # Create Firestore doctor profile
            doctor_profile = {
                'uid': user.uid,
                'doctor_id': doctor['id'],
                'email': doctor['email'],
                'name': doctor['name'],
                'specialty': doctor['specialty'],
                'qualification': doctor['qualification'],
                'experience': doctor['experience'],
                'rating': doctor['rating'],
                'reviews': doctor['reviews'],
                'languages': doctor['languages'],
                'location': {
                    'hospital': doctor['hospital'],
                    'address': doctor['address'],
                    'area': doctor['area'],
                    'distance': doctor['distance']
                },
                'consultation_fee': doctor['consultation_fee'],
                'phone': doctor['phone'],
                'role': 'doctor',
                'account_status': 'active',
                'created_at': datetime.now().isoformat()
            }
            
            # Save to Firestore
            db.collection('doctors').document(user.uid).set(doctor_profile)
            
            print(f"   💾 Created Firestore profile with UID: {user.uid}")
            
            # Store credentials
            created_accounts.append({
                'name': doctor['name'],
                'email': doctor['email'],
                'password': DEFAULT_PASSWORD,
                'uid': user.uid,
                'specialty': doctor['specialty']
            })
            
        except Exception as e:
            print(f"❌ [{i}/30] Failed: {doctor['name']} - {str(e)}")
            failed_accounts.append({
                'name': doctor['name'],
                'email': doctor['email'],
                'error': str(e)
            })
    
    print(f"\n{'='*60}")
    print(f"✅ Successfully created: {len(created_accounts)} accounts")
    print(f"❌ Failed: {len(failed_accounts)} accounts")
    print(f"{'='*60}\n")
    
    return created_accounts, failed_accounts

def save_credentials_file(accounts):
    """Save all doctor credentials to a file"""
    
    # Create credentials text file
    with open('DOCTOR_CREDENTIALS.txt', 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("DOCAI - DOCTOR LOGIN CREDENTIALS\n")
        f.write("="*80 + "\n\n")
        f.write(f"Total Doctors: {len(accounts)}\n")
        f.write(f"Default Password: {DEFAULT_PASSWORD}\n")
        f.write(f"Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("="*80 + "\n\n")
        
        # Group by specialty
        specialties = {}
        for acc in accounts:
            spec = acc['specialty']
            if spec not in specialties:
                specialties[spec] = []
            specialties[spec].append(acc)
        
        # Write grouped credentials
        for specialty, doctors in sorted(specialties.items()):
            f.write(f"\n{'='*80}\n")
            f.write(f"{specialty.upper()} ({len(doctors)} doctors)\n")
            f.write(f"{'='*80}\n\n")
            
            for doc in doctors:
                f.write(f"Name:     {doc['name']}\n")
                f.write(f"Email:    {doc['email']}\n")
                f.write(f"Password: {doc['password']}\n")
                f.write(f"UID:      {doc['uid']}\n")
                f.write(f"{'-'*80}\n\n")
    
    print(f"📄 Credentials saved to: DOCTOR_CREDENTIALS.txt")
    
    # Also save as JSON
    with open('DOCTOR_CREDENTIALS.json', 'w', encoding='utf-8') as f:
        json.dump({
            'total_doctors': len(accounts),
            'default_password': DEFAULT_PASSWORD,
            'created_at': datetime.now().isoformat(),
            'doctors': accounts
        }, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Credentials saved to: DOCTOR_CREDENTIALS.json")

if __name__ == "__main__":
    print("\n" + "="*80)
    print("FIREBASE DOCTOR ACCOUNT SETUP")
    print("="*80 + "\n")
    
    # Create accounts
    created, failed = create_doctor_accounts()
    
    # Save credentials
    if created:
        save_credentials_file(created)
    
    # Print summary
    if failed:
        print("\n⚠️ Failed Accounts:")
        for fail in failed:
            print(f"   - {fail['name']}: {fail['error']}")
    
    print("\n✅ Setup complete!\n")
