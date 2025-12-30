
import json
import os
import uuid
from typing import List, Optional, Dict
from pydantic import BaseModel

# --- DATA MODELS ---

class Profile(BaseModel):
    id: str
    name: str
    age: int
    gender: str  # Male, Female, Other
    relation: str # Self, Spouse, Child, Parent, Other
    blood_group: Optional[str] = None
    
class User(BaseModel):
    id: str
    email: str
    phone: str
    password: str # In production, hash this!
    address: str
    profiles: List[Profile]
    
# --- REPOSITORY ---

DB_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

def load_db() -> Dict[str, dict]:
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_db(data: Dict[str, dict]):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# --- SERVICE METHODS ---

def signup_user(email, password, phone, address, initial_profile_data):
    db = load_db()
    
    # Check if exists
    if email in db:
        return {"success": False, "error": "User already exists"}
    
    # Create Profile
    profile_id = str(uuid.uuid4())
    profile = {
        "id": profile_id,
        "name": initial_profile_data["name"],
        "age": initial_profile_data["age"],
        "gender": initial_profile_data["gender"],
        "relation": "Self", # First profile is always Self
        "blood_group": initial_profile_data.get("blood_group")
    }
    
    # Create User
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "password": password, 
        "phone": phone,
        "address": address,
        "profiles": [profile]
    }
    
    db[email] = user
    save_db(db)
    
    return {"success": True, "user": user}

def login_user(email, password):
    db = load_db()
    
    if email not in db:
        return {"success": False, "error": "User not found"}
        
    user = db[email]
    if user["password"] != password:
        return {"success": False, "error": "Invalid password"}
        
    return {"success": True, "user": user}

def add_profile(email, profile_data):
    db = load_db()
    
    if email not in db:
        return {"success": False, "error": "User not found"}
        
    new_profile = {
        "id": str(uuid.uuid4()),
        "name": profile_data["name"],
        "age": profile_data["age"],
        "gender": profile_data["gender"],
        "relation": profile_data["relation"],
        "blood_group": profile_data.get("blood_group")
    }
    
    db[email]["profiles"].append(new_profile)
    save_db(db)
    
    return {"success": True, "profiles": db[email]["profiles"]}
