"""
Firebase Admin SDK Configuration
Handles initialization and provides database/auth instances
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK with service account
    """
    try:
        # Check if already initialized
        firebase_admin.get_app()
        print("✅ [Firebase] Already initialized")
    except ValueError:
        # Initialize for the first time
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("✅ [Firebase] Initialized with service account")
        else:
            print("⚠️ [Firebase] Service account key not found")
            print(f"   Looking for: {cred_path}")
            print("   Firebase features will be disabled")
            return None
    
    return firestore.client()

# Initialize on import
db = initialize_firebase()

# Export instances
def get_db():
    """Get Firestore database instance"""
    return db

def get_auth():
    """Get Firebase Auth instance"""
    return auth
