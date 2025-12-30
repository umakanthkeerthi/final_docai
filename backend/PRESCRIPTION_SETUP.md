# Prescription Analyzer - Setup Instructions

## 📋 Prerequisites

### 1. Install Tesseract OCR (Required)

**Windows:**
1. Download Tesseract installer from:
   https://github.com/UB-Mannheim/tesseract/wiki
   
2. Run the installer (tesseract-ocr-w64-setup-5.3.x.exe)

3. During installation, note the installation path:
   Default: `C:\Program Files\Tesseract-OCR`

4. Add Tesseract to PATH (optional but recommended):
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Edit "Path" → Add: `C:\Program Files\Tesseract-OCR`

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- pytesseract (Python wrapper for Tesseract)
- Pillow (Image processing)
- pdf2image (PDF support)

## 🧪 Testing

Test if Tesseract is installed correctly:

```bash
cd backend
python -c "import pytesseract; print(pytesseract.get_tesseract_version())"
```

Should output: `tesseract 5.3.x`

## 🚀 Usage

### API Endpoint:
```
POST /api/analyze_prescription
Content-Type: multipart/form-data
Body: image file (JPEG, PNG, PDF)
```

### Response Format:
```json
{
  "success": true,
  "doctor": {
    "name": "Dr. Sarah Chen",
    "specialization": "General Physician",
    "registration": "MCI12345"
  },
  "patient": {
    "name": "John Doe",
    "age": "35",
    "gender": "Male"
  },
  "date": "2024-01-15",
  "diagnosis": "Upper Respiratory Tract Infection",
  "medicines": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food",
      "route": "Oral"
    }
  ],
  "notes": null,
  "raw_ocr_text": "Full OCR extracted text..."
}
```

## 📝 Notes

- Works best with **printed prescriptions**
- Clear, high-resolution images give better results
- Handwritten prescriptions may have lower accuracy
- LLM post-processing helps correct OCR errors

## 🔧 Troubleshooting

**Error: "Tesseract not found"**
- Install Tesseract from the link above
- Check installation path matches code
- Restart terminal after installation

**Error: "Could not extract text"**
- Ensure image is clear and readable
- Try preprocessing the image (increase contrast)
- Check if image contains actual text

**Low accuracy:**
- Use higher resolution images
- Ensure good lighting
- Avoid blurry or tilted images
