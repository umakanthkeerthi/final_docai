"""
Prescription Analyzer - OCR + AI Extraction
Uses Tesseract OCR to extract text from prescription images
Then uses Groq LLM to structure the data
"""

import os
import json
from groq import Groq
from PIL import Image
import pytesseract
import io
import re

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Configure Tesseract path (Windows)
# User will need to install Tesseract separately
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Default installation path:
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    print("✅ [Rx Analyzer] Tesseract found")
else:
    print("⚠️ [Rx Analyzer] Tesseract not found at default path")
    print("   Please install from: https://github.com/UB-Mannheim/tesseract/wiki")


def preprocess_image(image):
    """
    Preprocess image for better OCR accuracy
    """
    from PIL import ImageEnhance, ImageFilter
    
    # Convert to grayscale
    image = image.convert('L')
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    
    # Sharpen
    image = image.filter(ImageFilter.SHARPEN)
    
    return image


def extract_text_from_image(image_bytes):
    """
    Extract text from image using Tesseract OCR (local) or Groq Vision API (cloud)
    """
    # Check if Tesseract is available (for local development)
    tesseract_available = os.path.exists(TESSERACT_PATH)
    
    if tesseract_available:
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess
            processed_image = preprocess_image(image)
            
            # Extract text with Tesseract
            raw_text = pytesseract.image_to_string(processed_image)
            
            print(f"📄 [Rx Analyzer] Tesseract extracted {len(raw_text)} characters")
            return raw_text
            
        except Exception as e:
            print(f"⚠️ [Rx Analyzer] Tesseract failed: {e}, falling back to cloud OCR")
            tesseract_available = False
    
    # Fallback to cloud-based vision (for production/Render)
    if not tesseract_available:
        try:
            import base64
            
            # Convert image to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Use Groq's vision model to extract text
            print("☁️ [Rx Analyzer] Using cloud vision API...")
            
            completion = client.chat.completions.create(
                model="llava-v1.5-7b-4096-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract ALL text from this prescription image. Return only the raw text, exactly as it appears. Include doctor name, patient details, medicines, dosages, and all other text."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0,
                max_tokens=2000
            )
            
            raw_text = completion.choices[0].message.content
            print(f"📄 [Rx Analyzer] Cloud vision extracted {len(raw_text)} characters")
            return raw_text
            
        except Exception as e:
            print(f"❌ [Rx Analyzer] Cloud OCR Error: {e}")
            raise Exception(f"Failed to extract text from image: {str(e)}")


def analyze_prescription(image_bytes):
    """
    Complete prescription analysis pipeline
    1. OCR extraction
    2. LLM structuring
    """
    
    # Step 1: Extract text with OCR
    raw_text = extract_text_from_image(image_bytes)
    
    if not raw_text or len(raw_text.strip()) < 10:
        return {
            "success": False,
            "error": "Could not extract text from image. Please ensure the image is clear and contains text."
        }
    
    print(f"🔍 [Rx Analyzer] Raw OCR text:\n{raw_text[:200]}...")
    
    # Step 2: Use LLM to structure the data
    system_prompt = """You are a medical prescription analyzer. Extract structured information from OCR text.

Your response MUST be valid JSON with this structure:
{
    "success": true,
    "doctor": {
        "name": "doctor name or null",
        "specialization": "specialty or null",
        "registration": "registration number or null"
    },
    "patient": {
        "name": "patient name or null",
        "age": "age or null",
        "gender": "gender or null"
    },
    "date": "prescription date or null",
    "diagnosis": "diagnosis or null",
    "medicines": [
        {
            "name": "medicine name",
            "dosage": "dosage (e.g., 500mg)",
            "frequency": "how often (e.g., 3 times daily, TID, BID)",
            "duration": "how long (e.g., 7 days)",
            "instructions": "special instructions (e.g., take with food)",
            "route": "route of administration (e.g., Oral, IV)"
        }
    ],
    "notes": "any additional notes or null"
}

Common medical abbreviations:
- TID/t.i.d = 3 times daily
- BID/b.i.d = 2 times daily
- QID/q.i.d = 4 times daily
- OD/o.d = Once daily
- SOS = As needed
- PRN = As needed
- PO = By mouth (Oral)
- HS = At bedtime

Extract ALL medicines mentioned. If information is unclear or missing, use null."""

    user_prompt = f"""Extract prescription information from this OCR text:

{raw_text}

Return structured JSON."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        # Add raw OCR text to result
        result["raw_ocr_text"] = raw_text
        
        print(f"✅ [Rx Analyzer] Extracted {len(result.get('medicines', []))} medicines")
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ [Rx Analyzer] JSON parse error: {e}")
        print(f"Raw response: {response_text}")
        return {
            "success": False,
            "error": "Failed to parse prescription data",
            "raw_ocr_text": raw_text
        }
    
    except Exception as e:
        print(f"❌ [Rx Analyzer] Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "raw_ocr_text": raw_text
        }


if __name__ == "__main__":
    # Test with a sample prescription image
    print("Prescription Analyzer Test")
    print("="*60)
    print("To test, provide a prescription image path")
