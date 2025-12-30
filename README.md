# 🩺 DocAI - AI-Powered Medical Assistant

**DocAI** is an intelligent healthcare platform that provides instant medical triage, symptom analysis, prescription scanning, and nearby pharmacy locator - all powered by advanced AI.

---

## ✨ Features

### 🚨 **Emergency Triage**
- Instant symptom analysis using AI (Llama-3.3-70b)
- Emergency detection with safety-first approach
- Immediate action recommendations

### 💬 **AI Medical Chatbot**
- 24/7 medical guidance
- RAG-powered responses using NHSRC guidelines
- Context-aware conversations

### 📋 **Prescription Scanner (OCR)**
- Upload prescription images
- Extract medication details automatically
- Powered by Tesseract OCR + Groq Vision

### 🗺️ **Pharmacy Locator**
- Find nearby pharmacies on live map
- Real-time location tracking
- Distance and availability info

### 👥 **Family Health Management**
- Multiple user profiles
- Track health for entire family
- Secure authentication

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **CSS3** - Modern styling with animations

### Backend
- **FastAPI** - Python web framework
- **Groq AI** - LLM inference (Llama-3.3-70b)
- **ChromaDB** - Vector database for RAG
- **Tesseract OCR** - Prescription text extraction

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Firebase** - Database & Authentication

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Groq API Key ([Get one here](https://console.groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/docai.git
cd docai
```

2. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_api_key_here" > .env

# Run server
python main.py
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Deploy backend to [Render](https://render.com)
3. Deploy frontend to [Vercel](https://vercel.com)
4. Configure Firebase for database

---

## 🔐 Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key
PYTHON_VERSION=3.11.0
```

### Frontend (Vercel)
```env
VITE_API_BASE=https://your-backend.onrender.com/api
```

---

## ⚠️ Disclaimer

**DocAI is for informational purposes only and should not replace professional medical advice.** Always consult a qualified healthcare provider for medical emergencies or health concerns.

---

Made with ❤️ and AI
