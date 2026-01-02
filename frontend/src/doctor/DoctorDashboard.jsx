import React, { useState, useEffect } from 'react';

export default function DoctorDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('queue');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showTranscript, setShowTranscript] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // MOCK DATA for Initial Build
    const patients = [
        {
            id: 101,
            name: "Rajesh Kumar",
            age: 45,
            gender: "Male",
            blood_group: "B+",
            phone: "+91 98765 43210",
            status: "Emergency",
            symptom: "Severe Chest Pain, Radiating to left arm",
            triage_score: 9.5,
            wait_time: "2 mins",
            summary: "Patient reports sudden onset crushing chest pain. AI Triage flagged as possible MI. Immediate attention required.",
            transcript: [
                { sender: 'ai', text: 'Hello Rajesh, how can I help you today?' },
                { sender: 'user', text: 'I have a terrible pain in my chest. It feels heavy.' },
                { sender: 'ai', text: 'I am sorry to hear that. Does the pain move anywhere else?' },
                { sender: 'user', text: 'Yes, it goes down my left arm.' },
                { sender: 'ai', text: 'This sounds serious. Is it hard to breathe?' },
                { sender: 'user', text: 'Yes, a little bit.' }
            ]
        },
        {
            id: 102,
            name: "Priya Sharma",
            age: 28,
            gender: "Female",
            blood_group: "A+",
            phone: "+91 99887 76655",
            status: "Urgent",
            symptom: "High Fever (103F) & Chills",
            triage_score: 7.0,
            wait_time: "15 mins",
            summary: "Fever persisting for 2 days. NSAIDs not helping. No breathing difficulty.",
            transcript: [
                { sender: 'ai', text: 'Hi Priya, what seems to be the problem?' },
                { sender: 'user', text: 'I have had a high fever for 2 days now.' },
                { sender: 'ai', text: 'Have you taken any medicine?' },
                { sender: 'user', text: 'Yes, paracetamol but it comes back.' }
            ]
        },
        {
            id: 103,
            name: "Vikram Singh",
            age: 62,
            gender: "Male",
            blood_group: "O+",
            phone: "+91 77665 54433",
            status: "Routine",
            symptom: "General Checkup / Joint Pain",
            triage_score: 3.0,
            wait_time: "45 mins",
            summary: "Chronic knee pain. Requesting refill for medication.",
            transcript: [
                { sender: 'ai', text: 'Good morning Vikram.' },
                { sender: 'user', text: 'My knees are hurting again. I need more tablets.' },
                { sender: 'ai', text: 'Okay, checking your prescription history.' }
            ]
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Emergency': return '#ef4444'; // Red
            case 'Urgent': return '#f59e0b';    // Orange
            default: return '#10b981';          // Green
        }
    };

    // If mobile and patient selected, show ONLY details
    // If mobile and NO patient, show ONLY list
    // If desktop, show Split View
    const showList = !isMobile || (isMobile && !selectedPatient);
    const showDetails = !isMobile || (isMobile && selectedPatient);

    return (
        <div style={{ height: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* DOCTOR HEADER */}
            <header style={{ background: '#0f766e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>👨‍⚕️</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Dr. AI Dashboard</h1>
                        {!isMobile && <div style={{ fontSize: 12, opacity: 0.8 }}>Emergency Dept • Shift A</div>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    {!isMobile && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. Mehta</div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>General Physician</div>
                        </div>
                    )}
                    <button
                        onClick={onLogout}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                    >
                        {isMobile ? 'Exit' : 'Switch to Patient'}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: 'row' }}>

                {/* LEFT: PATIENT LIST */}
                {showList && (
                    <div style={{
                        width: isMobile ? '100%' : '350px',
                        background: 'white',
                        borderRight: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ margin: 0, fontSize: 16, color: '#334155' }}>Patient Queue ({patients.length})</h2>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {patients.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPatient(p)}
                                    style={{
                                        padding: 16,
                                        borderBottom: '1px solid #f1f5f9',
                                        cursor: 'pointer',
                                        background: selectedPatient?.id === p.id ? '#f0fdfa' : 'white',
                                        borderLeft: selectedPatient?.id === p.id ? '4px solid #0f766e' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                            background: `${getStatusColor(p.status)}20`, color: getStatusColor(p.status)
                                        }}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                                        {p.symptom}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        Wait: {p.wait_time} • {p.gender}, {p.age}y
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RIGHT: PATIENT DETAILS */}
                {showDetails && (
                    <main style={{ flex: 1, padding: isMobile ? 16 : 24, overflowY: 'auto', background: '#f1f5f9' }}>
                        {selectedPatient ? (
                            <div style={{ maxWidth: 800, margin: '0 auto', height: '100%' }}>
                                {isMobile && (
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        style={{ marginBottom: 16, background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}
                                    >
                                        ← Back to Queue
                                    </button>
                                )}

                                {/* TOP CARD: VITALS & BIO */}
                                <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>{selectedPatient.name}</h2>
                                            <div style={{ color: '#64748b', display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span>{selectedPatient.gender}</span>
                                                <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%' }}></span>
                                                <span>{selectedPatient.age} years</span>
                                                <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%' }}></span>
                                                <span style={{ fontWeight: 600, color: '#ef4444' }}>{selectedPatient.blood_group}</span>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                                                📞 {selectedPatient.phone}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>AI Score</div>
                                            <div style={{ fontSize: 28, fontWeight: 700, color: getStatusColor(selectedPatient.status) }}>
                                                {selectedPatient.triage_score}/10
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
                                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>Heart Rate</div>
                                            <div style={{ fontSize: 16, fontWeight: 600 }}>110 bpm</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>BP</div>
                                            <div style={{ fontSize: 16, fontWeight: 600 }}>145/95</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>Temp</div>
                                            <div style={{ fontSize: 16, fontWeight: 600 }}>98.6 F</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>O2 Sat</div>
                                            <div style={{ fontSize: 16, fontWeight: 600 }}>98%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* MIDDLE CARD: AI SUMMARY */}
                                <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #0f766e' }}>
                                    <h3 style={{ marginTop: 0, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>🤖</span> AI Summary
                                    </h3>
                                    <p style={{ lineHeight: 1.6, color: '#334155' }}>
                                        {selectedPatient.summary}
                                    </p>
                                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                                        <button
                                            onClick={() => setShowTranscript(true)}
                                            style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, width: '100%' }}>
                                            View Full Transcript
                                        </button>
                                    </div>
                                </div>

                                {/* CONSULTATION ACTIONS */}
                                <div style={{ marginTop: 24 }}>
                                    <h3 style={{ fontSize: 16, color: '#334155', marginBottom: 16 }}>Consultation Actions</h3>

                                    {selectedPatient.status === 'Emergency' ? (
                                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#b91c1c' }}>
                                            <div style={{ fontSize: 24 }}>🚨</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>Emergency Protocol</div>
                                                <div style={{ fontSize: 13 }}>Remote consultation unavailable. Patient advised to proceed to ER immediately.</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <button
                                                onClick={() => alert('Opening Secure Chat...')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    background: 'white', border: '2px solid #0f766e', color: '#0f766e',
                                                    padding: '16px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 15
                                                }}>
                                                <span>💬</span> Chat
                                            </button>
                                            <button
                                                onClick={() => alert('Connecting Video Call...')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    background: '#6366f1', border: 'none', color: 'white',
                                                    padding: '16px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 15,
                                                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
                                                }}>
                                                <span>📹</span> Video Call
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Desktop placeholder when no patient selected
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 16 }}>
                                <div style={{ fontSize: 64 }}>📋</div>
                                <div>Select a patient from the queue to view details</div>
                            </div>
                        )}
                    </main>
                )}
            </div>

            {/* TRANSCRIPT MODAL OVERLAY */}
            {selectedPatient && showTranscript && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
                }} onClick={() => setShowTranscript(false)}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: '500px', height: '80%',
                        borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>

                        <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Chat Transcript</h3>
                            <button onClick={() => setShowTranscript(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {selectedPatient.transcript && selectedPatient.transcript.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.sender === 'user' ? '#0f766e' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                                    padding: '10px 16px',
                                    borderRadius: 16,
                                    borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                                    borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 16,
                                    maxWidth: '85%',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    fontSize: 14
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
