"""
Test script to check Groq Vision API availability
"""

import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("🔍 Checking Groq API capabilities...\n")

# List available models
try:
    models = client.models.list()
    print("✅ Available Groq Models:")
    print("="*60)
    
    vision_models = []
    text_models = []
    
    for model in models.data:
        model_id = model.id
        print(f"  • {model_id}")
        
        # Check if it's a vision model
        if 'vision' in model_id.lower() or 'llava' in model_id.lower():
            vision_models.append(model_id)
        else:
            text_models.append(model_id)
    
    print("\n" + "="*60)
    print(f"\n📊 Summary:")
    print(f"  Total models: {len(models.data)}")
    print(f"  Vision models: {len(vision_models)}")
    print(f"  Text models: {len(text_models)}")
    
    if vision_models:
        print(f"\n✅ VISION MODELS AVAILABLE:")
        for vm in vision_models:
            print(f"  ✓ {vm}")
    else:
        print(f"\n⚠️ NO VISION MODELS FOUND")
        print(f"  We'll need to use alternative OCR (Tesseract)")
    
except Exception as e:
    print(f"❌ Error checking models: {e}")
