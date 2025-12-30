# 🚀 DocAI Deployment Guide

Complete guide to deploy DocAI to production using Render, Vercel, and Firebase.

---

## 📋 Prerequisites

1. **GitHub Account** - To host your code
2. **Render Account** - Sign up at https://render.com (free)
3. **Vercel Account** - Sign up at https://vercel.com (free)
4. **Firebase Account** - Sign up at https://firebase.google.com (free)

---

## 🔥 Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Name it: `docai-production`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Firestore Database
1. In Firebase Console → Build → Firestore Database
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location: `us-central` (or nearest to you)
5. Click "Enable"

### 1.3 Enable Authentication
1. In Firebase Console → Build → Authentication
2. Click "Get Started"
3. Enable these sign-in methods:
   - ✅ Email/Password
   - ✅ Google (optional)
4. Click "Save"

### 1.4 Enable Storage
1. In Firebase Console → Build → Storage
2. Click "Get Started"
3. Choose "Start in production mode"
4. Click "Done"

### 1.5 Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" → Click Web icon (</>)
3. Register app: `docai-web`
4. Copy the `firebaseConfig` object
5. **Save this for later!**

### 1.6 Get Service Account Key (for Backend)
1. Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. **Keep this file secure!**

---

## 🐍 Step 2: Backend Deployment (Render)

### 2.1 Push Code to GitHub
```bash
cd c:\Users\keert\.gemini\antigravity\scratch\final_docai

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for deployment"

# Create GitHub repo (go to github.com → New Repository → docai)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/docai.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `docai` repository
5. Configure:
   - **Name:** `docai-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click "Advanced" → Add Environment Variables:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
   - `PYTHON_VERSION` = `3.11.0`
7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. **Copy your backend URL:** `https://docai-backend.onrender.com`

---

## ⚡ Step 3: Frontend Deployment (Vercel)

### 3.1 Update API Base URL
1. Open `frontend/src/config.js`
2. Change:
   ```javascript
   export const API_BASE = "https://docai-backend.onrender.com/api";
   ```

### 3.2 Build Frontend
```bash
cd frontend
npm run build
```

### 3.3 Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE` = `https://docai-backend.onrender.com/api`
5. Click "Deploy"
6. Wait 2-3 minutes
7. **Your app is live!** 🎉

---

## 🔒 Step 4: Security & Production Settings

### 4.1 Update Backend CORS
Edit `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Your Vercel domain
        "https://docai.com"  # Your custom domain (if any)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4.2 Add Rate Limiting
Install: `pip install slowapi`

Add to `main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/triage")
@limiter.limit("10/minute")  # Max 10 requests per minute
async def triage_endpoint(request: Request):
    # ... existing code
```

---

## 🌐 Step 5: Custom Domain (Optional)

### 5.1 Buy Domain
- Namecheap: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$10/year

### 5.2 Configure Vercel
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `docai.com`
3. Follow DNS instructions

### 5.3 Configure Render
1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add: `api.docai.com`
3. Update DNS with provided CNAME

---

## 📊 Step 6: Monitoring & Analytics

### 6.1 Add Error Tracking (Sentry)
```bash
npm install @sentry/react @sentry/vite-plugin
```

### 6.2 Add Analytics (Plausible - Privacy-friendly)
Add to `index.html`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Environment variables set on Render
- [ ] Frontend built successfully
- [ ] Frontend deployed to Vercel
- [ ] API_BASE updated in config
- [ ] CORS configured for production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto)
- [ ] Monitoring set up

---

## 🆘 Troubleshooting

### Backend Issues
**Problem:** "Module not found"
- **Solution:** Check `requirements.txt` has all dependencies
- Run: `pip freeze > requirements.txt`

**Problem:** "Port already in use"
- **Solution:** Render auto-assigns port via `$PORT` variable

### Frontend Issues
**Problem:** "API calls failing"
- **Solution:** Check CORS settings in backend
- Verify API_BASE URL is correct

**Problem:** "404 on refresh"
- **Solution:** Ensure `vercel.json` has SPA routing config

---

## 🎯 Next Steps

1. **Test everything** on production URLs
2. **Set up backups** for Firestore
3. **Monitor usage** to stay within free tiers
4. **Add CI/CD** for automatic deployments
5. **Scale** when needed (upgrade plans)

---

## 💰 Cost Summary (Free Tier)

| Service | Free Tier Limits | Cost |
|---------|-----------------|------|
| Render | 750 hours/month | $0 |
| Vercel | Unlimited deployments | $0 |
| Firebase | 50K reads/day, 20K writes/day | $0 |
| Domain | - | $12/year |
| **Total** | | **$1/month** |

---

## 🚀 You're Live!

Your app is now accessible at:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://docai-backend.onrender.com`

**Share it with the world!** 🌍
