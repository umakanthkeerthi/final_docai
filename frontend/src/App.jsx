import { useState, useEffect } from 'react'
import './index.css'
import { API_BASE } from './config'
import { useAuth } from './contexts/AuthContext'
import { auth } from './firebase'
import Layout from './components/Layout'
import HomeView from './components/HomeView'
import TriageView from './components/TriageView'
import ChatView from './components/ChatView'
import AppointmentBooking from './components/AppointmentBooking'
import SummaryView from './components/SummaryView'

import DoctorProfile from './components/DoctorProfile';
import PharmacyMap from './components/PharmacyMap';
import RecordsView from './components/RecordsView';
import MedicationView from './components/MedicationView';
import RxAnalyzer from './components/RxAnalyzer';
import SymptomCheckerView from './components/SymptomCheckerView';
import WelcomeAnimation from './components/WelcomeAnimation';
import AuthView from './components/AuthView';
import ProfileSelector from './components/ProfileSelector';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorLogin from './components/DoctorLogin';

function App() {
  // --- FIREBASE AUTH ---
  const { currentUser, userProfiles, logout } = useAuth();

  // --- APP STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [view, setView] = useState('home');

  // --- DOCTOR STATE ---
  const [doctorData, setDoctorData] = useState(null);

  // --- TRIAGE STATE ---
  const [triageResult, setTriageResult] = useState(null);
  const [initialSymptom, setInitialSymptom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- HANDLERS ---
  const handleLoginSuccess = (userCredential) => {
    console.log('Login successful');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentProfile(null);
    setView('home');
  };

  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
  };

  const handleAnalyze = async (symptom) => {
    setIsAnalyzing(true);
    setInitialSymptom(symptom);

    try {
      const response = await fetch(`${API_BASE}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptom })
      });

      const data = await response.json();
      console.log('TRIAGE RESULT:', data);
      setTriageResult(data);

      // Route based on emergency status
      if (data.is_emergency === true || data.is_emergency === 'true' || data.is_emergency === 'True') {
        // EMERGENCY: Go to triage view (shows urgent booking)
        setView('triage');
      } else {
        // NON-EMERGENCY: Go to chat view
        setView('chat');
      }
    } catch (error) {
      console.error('Triage error:', error);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Doctor login handler
  const handleDoctorLogin = (doctor) => {
    setDoctorData(doctor);
  };

  // Doctor logout handler
  const handleDoctorLogout = async () => {
    await auth.signOut();
    setDoctorData(null);
  };

  // Check for authenticated doctor on mount (persist session)
  useEffect(() => {
    if (window.location.pathname === '/doctor') {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // User is logged in, check if they're a doctor
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');

            const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));

            if (doctorDoc.exists() && doctorDoc.data().role === 'doctor') {
              console.log('✅ Doctor session restored:', doctorDoc.data().name);
              // Ensure we include the UID in the doctor data
              setDoctorData({ ...doctorDoc.data(), uid: user.uid });
            } else {
              // Not a doctor, just clear doctor data (don't sign out!)
              setDoctorData(null);
            }
          } catch (error) {
            console.error('Error checking doctor auth:', error);
            setDoctorData(null);
          }
        } else {
          // No user logged in
          setDoctorData(null);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // --- VIEW RENDERING ---

  // 1. SPLASH SCREEN
  if (showSplash) {
    return <WelcomeAnimation onComplete={() => setShowSplash(false)} />;
  }

  // 2. DOCTOR PORTAL ROUTE (accessible at /doctor)
  if (window.location.pathname === '/doctor') {
    if (!doctorData) {
      return <DoctorLogin onLoginSuccess={handleDoctorLogin} />;
    }
    return <DoctorDashboard doctorData={doctorData} onLogout={handleDoctorLogout} />;
  }

  // 3. AUTH SCREEN (Login/Signup)
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. PROFILE SELECTOR (if no profile selected)
  if (!currentProfile) {
    return <ProfileSelector profiles={userProfiles} onSelect={handleProfileSelect} onLogout={handleLogout} />;
  }

  // 5. MAIN PATIENT DASHBOARD
  const handleNavigate = (newView) => {
    setView(newView);
  }

  return (
    <Layout currentView={view} onViewChange={handleNavigate} userProfile={currentProfile} onLogout={handleLogout}>

      {view === 'home' && (
        <HomeView
          onAnalyze={handleAnalyze}
          onViewChange={handleNavigate}
          userName={currentProfile.name}
          isAnalyzing={isAnalyzing}
        />
      )}

      {view === 'triage' && (
        <TriageView
          result={triageResult}
          onStartChat={() => handleNavigate('chat')}
          onBookSlot={() => handleNavigate('slot')}
          onStartOver={() => handleNavigate('home')}
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
        <AppointmentBooking
          onBack={() => handleNavigate('home')}
          triageResult={triageResult}
          isUrgent={triageResult?.is_emergency}
        />
      )}

      {view === 'summary' && (
        <SummaryView
          onHome={() => handleNavigate('home')}
          onBook={() => handleNavigate('slot')}
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
        <RecordsView
          selectedProfile={currentProfile}
        />
      )}
      {view === 'rx-upload' && (
        <RxAnalyzer
          onBack={() => handleNavigate('home')}
          currentUser={currentUser}
          selectedProfile={currentProfile}
        />
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
