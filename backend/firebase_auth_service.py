"""
Firebase Authentication Service
Handles user signup, login, and profile management using Firebase
"""

from firebase_config import get_db, get_auth
from firebase_admin import auth as admin_auth
import traceback

db = get_db()

def signup_user(email: str, password: str):
    """
    Create a new user with Firebase Authentication
    """
    try:
        # Create user in Firebase Auth
        user = admin_auth.create_user(
            email=email,
            password=password
        )
        
        # Create user profile in Firestore
        if db:
            db.collection('users').document(user.uid).set({
                'email': email,
                'profiles': [],
                'created_at': admin_auth.UserRecord.user_metadata
            })
        
        return {
            "success": True,
            "message": "User created successfully",
            "user_id": user.uid,
            "email": user.email
        }
    except admin_auth.EmailAlreadyExistsError:
        return {
            "success": False,
            "error": "Email already exists"
        }
    except Exception as e:
        print(f"Signup error: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


def login_user(email: str, password: str):
    """
    Verify user credentials and return user info
    Note: Firebase Admin SDK doesn't verify passwords directly.
    Password verification happens on the client side.
    This function validates the user exists.
    """
    try:
        # Get user by email
        user = admin_auth.get_user_by_email(email)
        
        # Get user profile from Firestore
        user_data = {"email": email, "profiles": []}
        if db:
            user_doc = db.collection('users').document(user.uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
        
        return {
            "success": True,
            "message": "Login successful",
            "user_id": user.uid,
            "email": user.email,
            "profiles": user_data.get('profiles', [])
        }
    except admin_auth.UserNotFoundError:
        return {
            "success": False,
            "error": "User not found"
        }
    except Exception as e:
        print(f"Login error: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


def add_profile(email: str, profile_data: dict):
    """
    Add a profile to user's account
    """
    try:
        user = admin_auth.get_user_by_email(email)
        
        if db:
            # Get current profiles
            user_ref = db.collection('users').document(user.uid)
            user_doc = user_ref.get()
            
            profiles = []
            if user_doc.exists:
                profiles = user_doc.to_dict().get('profiles', [])
            
            # Add new profile
            profile_data['id'] = len(profiles) + 1
            profiles.append(profile_data)
            
            # Update Firestore
            user_ref.set({'profiles': profiles}, merge=True)
        
        return {
            "success": True,
            "message": "Profile added successfully",
            "profile": profile_data
        }
    except Exception as e:
        print(f"Add profile error: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


def verify_token(id_token: str):
    """
    Verify Firebase ID token from frontend
    """
    try:
        decoded_token = admin_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return {
            "success": True,
            "uid": uid,
            "email": decoded_token.get('email')
        }
    except Exception as e:
        print(f"Token verification error: {e}")
        return {
            "success": False,
            "error": "Invalid token"
        }
