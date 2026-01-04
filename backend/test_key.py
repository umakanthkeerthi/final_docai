import os
from groq import Groq
from dotenv import load_dotenv

# Load env directly to be sure
load_dotenv(".env", override=True)
api_key = os.getenv("GROQ_API_KEY")

print(f"Testing API Key: {api_key[:10]}...{api_key[-5:]}")

client = Groq(api_key=api_key)

try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Test",
            }
        ],
        model="llama-3.3-70b-versatile",
    )
    print("✅ API Key is WORKING!")
    print(f"Response: {chat_completion.choices[0].message.content}")
except Exception as e:
    print("❌ API Key FAILED!")
    print(f"Error: {e}")
