#!/bin/bash

# DocAI Deployment Quick Start Script
# This script helps you deploy DocAI to production

echo "🚀 DocAI Deployment Assistant"
echo "=============================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git found"

# Check if GitHub repo is set up
if ! git remote -v | grep -q "origin"; then
    echo ""
    echo "📝 Step 1: Set up GitHub Repository"
    echo "-----------------------------------"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'docai'"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git remote add origin "$REPO_URL"
    git branch -M main
    git push -u origin main
    
    echo "✅ Code pushed to GitHub!"
else
    echo "✅ GitHub repository already configured"
fi

echo ""
echo "📋 Next Steps:"
echo "-------------"
echo ""
echo "1️⃣  RENDER (Backend Deployment)"
echo "   → Go to: https://dashboard.render.com"
echo "   → Click 'New +' → 'Web Service'"
echo "   → Connect your GitHub repo"
echo "   → Set Root Directory: backend"
echo "   → Add Environment Variable: GROQ_API_KEY"
echo ""
echo "2️⃣  VERCEL (Frontend Deployment)"
echo "   → Go to: https://vercel.com/new"
echo "   → Import your GitHub repo"
echo "   → Set Root Directory: frontend"
echo "   → Framework: Vite"
echo "   → Deploy!"
echo ""
echo "3️⃣  FIREBASE (Database Setup)"
echo "   → Go to: https://console.firebase.google.com"
echo "   → Create new project: docai-production"
echo "   → Enable Firestore, Authentication, Storage"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy Deploying!"
