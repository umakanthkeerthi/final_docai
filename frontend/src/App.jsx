import { useState, useEffect } from 'react'
import './index.css'
import { API_BASE } from './config'
import Layout from './components/Layout'
import HomeView from './components/HomeView'
import TriageView from './components/TriageView'
import ChatView from './components/ChatView'
import SlotView from './components/SlotView'
import SummaryView from './components/SummaryView'

import DoctorProfile from './components/DoctorProfile'
import PharmacyMap from './components/PharmacyMap'
import RecordsView from './components/RecordsView'
import MedicationView from './components/MedicationView'
import RxAnalyzer from './components/RxAnalyzer'
import SymptomCheckerView from './components/SymptomCheckerView'
import WelcomeAnimation from './components/WelcomeAnimation'
import AuthView from './components/AuthView'
import ProfileSelector from './components/ProfileSelector'

function App() {
  // --- APP STATE ---
  const [showSplash, setShowSplash] = useState(true); // Skip Splash
  // MOCK USER FOR UI TESTING
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [view, setView] = useState('home'); // Start in Chat
  const [triageResult, setTriageResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialSymptom, setInitialSymptom] = useState('');

  // --- PERSISTENCE ---
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('docai_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- HANDLERS ---
  const handleLoginSuccess = (userData) => {
    localStorage.setItem('docai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('docai_user');
    setUser(null);
    setCurrentProfile(null);
    setView('home');
  };

  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
    // You could also persist current profile to session storage if desired
  };

  const handleAnalyze = async (symptomText) => {
    if (!symptomText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom_text: symptomText })
      });

      const result = await response.json();
      console.log("TRIAGE RESULT:", result); // Debug log
      // alert(JSON.stringify(result)); // Uncomment if needed for extreme debugging
      setTriageResult(result);
      setInitialSymptom(symptomText); // Store for Chat input

      // ROUTING LOGIC
      if (result.is_emergency === true || result.is_emergency === 'true' || result.is_emergency === 'True') {
        handleNavigate('triage');
      } else {
        // SAFE -> DIRECT TO CHAT
        handleNavigate('chat');
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  // --- VIEW RENDERING ---

  // 1. SPLASH SCREEN
  if (showSplash) {
    return <WelcomeAnimation onComplete={() => setShowSplash(false)} />;
  }

  // 2. AUTH SCREEN (Login/Signup)
  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. PROFILE SELECTOR (Who is checking in?)
  if (!currentProfile) {
    return (
      <ProfileSelector
        user={user}
        onProfileValues={handleProfileSelect}
        onLogout={handleLogout}
      />
    );
  }

  // 4. MAIN DASHBOARD
  const handleNavigate = (newView) => {
    setView(newView);
  }

  return (
    <Layout currentView={view} onViewChange={handleNavigate} userProfile={currentProfile} onLogout={handleLogout}>

      {view === 'home' && (
        <HomeView
          onAnalyze={handleAnalyze}
          onViewChange={handleNavigate}
          userName={currentProfile.name} // Pass name to HomeView
          isAnalyzing={isAnalyzing}
        />
      )}

      {view === 'triage' && (
        <TriageView
          result={triageResult}
          onStartChat={() => handleNavigate('chat')}
          onBookSlot={() => handleNavigate('slot')}
        />
      )}

      {view === 'chat' && (
        <ChatView
          patientId={currentProfile.id}
          patientName={currentProfile.name}
          initialMessage={initialSymptom}
          onEndSession={() => handleNavigate('summary')}
          onEmergency={() => {
            setTriageResult({
              is_emergency: true,
              matched_condition: "Critical Symptom Detected in Chat",
              action: "Immediate Medical Attention",
              reason: "Patient reported critical symptoms (e.g., Chest Pain) during the AI consultation."
            });
            handleNavigate('triage');
          }}
        />
      )}

      {view === 'slot' && (
        <SlotView
          onConfirm={() => handleNavigate('home')}
          patientName={currentProfile.name}
        />
      )}

      {view === 'summary' && (
        <SummaryView
          sessionId="demo"
          onClose={() => handleNavigate('home')}
          patientName={currentProfile.name}
        />
      )}

      {view === 'doctor' && (
        <DoctorProfile onStartChat={() => handleNavigate('home')} />
      )}

      {view === 'stores' && (
        <PharmacyMap />
      )}

      {/* Placeholders for other nav items */}
      {view === 'meds' && (
        <MedicationView />
      )}
      {view === 'records' && (
        <RecordsView />
      )}
      {view === 'rx-upload' && (
        <RxAnalyzer onBack={() => handleNavigate('home')} />
      )}
      {view === 'symptom-checker' && (
        <SymptomCheckerView
          onBack={() => handleNavigate('home')}
          onBookAppointment={() => handleNavigate('slot')}
        />
      )}
    </Layout>
  )
}

export default App
