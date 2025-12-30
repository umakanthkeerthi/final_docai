from typing import Dict, List, Set, Optional
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

# --- DATA MODELS ---

class PatientState(BaseModel):
    """
    Persistent state for a single patient session.
    Uses SETS to ensure uniqueness (no duplicate symptoms).
    """
    session_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # Core Medical Data (Sets for uniqueness)
    confirmed_symptoms: Set[str] = Field(default_factory=set)
    denied_symptoms: Set[str] = Field(default_factory=set)
    unsure_aspects: Set[str] = Field(default_factory=set)
    
    # Singular values (Last known value wins, unless we implement history)
    duration: Optional[str] = None
    medications_taken: Optional[str] = None
    
    def to_dict(self):
        """Helper to convert sets to lists for JSON serialization/LLM prompting"""
        return {
            "session_id": self.session_id,
            "confirmed_symptoms": list(self.confirmed_symptoms),
            "denied_symptoms": list(self.denied_symptoms),
            "unsure_aspects": list(self.unsure_aspects),
            "duration": self.duration,
            "medications_taken": self.medications_taken
        }

    def merge_snapshot(self, new_snapshot: dict):
        """
        Smart Merge: Updates the state with new facts extracted from the latest turn.
        only adds, never deletes (unless we implement 'correction' logic later).
        """
        self.last_updated = datetime.now()
        
        # 1. Update Sets (Union)
        if new_snapshot.get('confirmed_symptoms'):
            self.confirmed_symptoms.update(new_snapshot['confirmed_symptoms'])
            # If confirmed, remove from unsure/denied if it was there previously
            self.denied_symptoms -= set(new_snapshot['confirmed_symptoms'])
            self.unsure_aspects -= set(new_snapshot['confirmed_symptoms'])

        if new_snapshot.get('denied_symptoms'):
            self.denied_symptoms.update(new_snapshot['denied_symptoms'])
            self.confirmed_symptoms -= set(new_snapshot['denied_symptoms'])
            self.unsure_aspects -= set(new_snapshot['denied_symptoms'])

        if new_snapshot.get('unsure_aspects'):
            self.unsure_aspects.update(new_snapshot['unsure_aspects'])
            
        # 2. Update Singulars (Overwrite if new value provided)
        if new_snapshot.get('duration'):
            self.duration = new_snapshot['duration']
            
        if new_snapshot.get('medications_taken'):
            self.medications_taken = new_snapshot['medications_taken']

# --- GLOBAL STORE (In-Memory for now) ---
# In production, this would be Redis or a Database
SESSIONS: Dict[str, PatientState] = {}

def get_session(session_id: str) -> PatientState:
    """Retrieves or creates a session."""
    if session_id not in SESSIONS:
        SESSIONS[session_id] = PatientState(session_id=session_id)
    return SESSIONS[session_id]

def clear_session(session_id: str):
    if session_id in SESSIONS:
        del SESSIONS[session_id]
