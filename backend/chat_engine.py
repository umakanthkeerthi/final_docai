import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def get_medical_response(message: str, user_id: str, chat_history: list = None) -> str:
    """
    Generate a medical response using Groq LLM.
    Args:
        message: The user's current message
        user_id: ID of the user/session (for tracking context if needed)
        chat_history: List of previous chat messages
    """
    if not client:
        return "Error: AI service is not configured (missing API key)."

    try:
        # Normalize chat_history if it was passed as keyword arg or regular arg
        history = chat_history if chat_history else []
        # Prepare messages for the LLM
        messages = [
            {
                "role": "system",
                "content": """You are Dr. AI, a helpful and empathetic virtual medical assistant. 
                Your goal is to provide preliminary medical advice, explanations, and comfort.
                ALWAYS clarify that you are an AI and not a real doctor.
                If symptoms seem severe (chest pain, difficulty breathing, severe bleeding), advise immediate medical attention.
                Keep responses concise, clear, and reassuring.
                Use simple language avoiding complex jargon where possible."""
            }
        ]
        
        # Add history if provided
        if history:
            for msg in history:
                role = "user" if msg.get("sender") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("message", "")})
        
        # Add current message
        messages.append({"role": "user", "content": message})

        # Call Groq API
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ [Chat Engine] Error: {e}")
        return "I apologize, but I'm having trouble connecting to my medical knowledge base right now. Please try again in a moment."

def generate_summary(text: str) -> str:
    """
    Generate a concise summary of the medical interaction.
    """
    if not client:
        return "Summary unavailable (AI config error)."
        
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Summarize the following medical symptom description in 2-3 key phrases."},
                {"role": "user", "content": text}
            ],
            temperature=0.1,
            max_tokens=50
        )
        return completion.choices[0].message.content
    except Exception:
        return text[:50] + "..."
