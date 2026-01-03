import React, { useState, useEffect, useRef } from 'react';
import './DoctorDashboard.css';

const API_BASE = 'http://localhost:8002/api';

export default function DoctorDashboard({ doctorData, onLogout }) {
    const [view, setView] = useState('dashboard'); // dashboard, appointments, messages, records
    const [records, setRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // Polling Ref
    const pollingRef = useRef(null);

    // Use doctor's UID for API calls
    const doctorUid = doctorData?.uid || '';
    const doctorId = doctorData?.doctor_id || '';

    // --- DATA FETCHING ---
    const fetchRecords = async () => {
        try {
            const res = await fetch(`${API_BASE}/doctor/incoming_records`);
            const data = await res.json();
            if (data.success) setRecords(data.records);
        } catch (e) {
            console.error("Records Error:", e);
            setRecords([]); // Graceful fallback
        }
    };

    const fetchAppointments = async () => {
        if (!doctorUid) return;
        try {
            const res = await fetch(`${API_BASE}/doctor/appointments/${doctorUid}`);
            const data = await res.json();
            if (data.success) setAppointments(data.appointments);
        } catch (e) {
            console.error("Appts Error:", e);
            setAppointments([]); // Graceful fallback
        }
    };

    const fetchChat = async () => {
        try {
            // For now, use a placeholder patient ID - in production this would come from selected appointment
            const patientId = 'guest';
            const res = await fetch(`${API_BASE}/messages/conversation?patientId=${patientId}&doctorId=${doctorId}`);
            const data = await res.json();
            if (data.success) setMessages(data.messages);
        } catch (e) {
            console.error("Chat Error:", e);
            setMessages([]); // Graceful fallback
        }
    };

    // --- ACTIONS ---
    const handleCompleteAppt = async (id) => {
        const notes = prompt("Enter consultation notes:");
        if (!notes) return;

        try {
            await fetch(`${API_BASE}/doctor/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed', notes })
            });
            alert("Marked Completed");
            fetchAppointments();
        } catch (e) { alert(e.message); }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        const msg = chatInput.trim();
        setChatInput(""); // optimistic

        try {
            await fetch(`${API_BASE}/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: CURRENT_PATIENT_ID,
                    doctorId: DOCTOR_ID,
                    patientName: "Simulated Patient",
                    doctorName: "Dr. Sarah Chen",
                    message: msg,
                    sender: "doctor"
                })
            });
            fetchChat();
        } catch (e) { alert(e.message); }
    };

    // --- EFFECTS ---
    useEffect(() => {
        // Initial Load
        fetchRecords();
        fetchAppointments();
        fetchChat();

        // Polling for Chat
        pollingRef.current = setInterval(() => {
            if (view === 'messages') fetchChat();
        }, 3000);

        return () => clearInterval(pollingRef.current);
    }, [view]);


    // --- RENDERS ---
    const renderRecordsTable = () => {
        if (records.length === 0) return <tr><td colSpan="5" style={{ textAlign: 'center', padding: 30 }}>No pending records.</td></tr>;

        return records.map(r => {
            const isFailed = r.ai_status === 'failed';
            return (
                <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td><div className="patient-name">Patient {r.user_id.slice(0, 6)}...</div></td>
                    <td>{r.category} {isFailed && "(Failed)"}</td>
                    <td>
                        <div className="summary-box">
                            {isFailed ? (
                                <>
                                    <span className="alert-text">⚠️ AI Failed</span>
                                    <div style={{ fontSize: 11, marginTop: 4 }}>{r.error_details || "Unknown"}</div>
                                </>
                            ) : (
                                "Details in file"
                            )}
                        </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-action btn-primary" onClick={() => alert("Open Viewer")}>Review</button>
                            <button className="btn-action btn-secondary">Dismiss</button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="doctor-app">
            {/* SIDEBAR */}
            <div id="sidebar">
                <div className="logo-area">
                    <div className="logo-icon">+</div>
                    <div>DocAI Provider</div>
                </div>

                <div className="nav-section">
                    <div className="nav-label">Clinical</div>
                    <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                        <span className="nav-icon">⊞</span> Dashboard
                    </div>
                    <div className={`nav-item ${view === 'appointments' ? 'active' : ''}`} onClick={() => setView('appointments')}>
                        <span className="nav-icon">📅</span> Appointments
                    </div>
                    {/* <div className={`nav-item ${view === 'messages' ? 'active' : ''}`} onClick={() => setView('messages')}>
                        <span className="nav-icon">💬</span> Messages
                    </div> */}
                </div>

                {/* 
                <div className="nav-section">
                    <div className="nav-label">Administrative</div>
                    <div className={`nav-item ${view === 'records' ? 'active' : ''}`} onClick={() => setView('records')}>
                        <span className="nav-icon">📄</span> Incoming Records
                        <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{records.length}</span>
                    </div>
                </div> 
                */}
            </div>

            {/* MAIN CONTENT */}
            <div id="main-content">
                <header>
                    <div className="header-title">
                        {view === 'dashboard' && "Dashboard Overview"}
                        {view === 'appointments' && "Calendar & Scheduling"}
                        {view === 'messages' && "Patient Messages"}
                        {view === 'records' && "Records for Review"}
                    </div>
                    <div className="user-profile">
                        <button className="btn-bell">🔔</button>
                        <div className="user-info">
                            <div className="user-name">{doctorData?.name || 'Doctor'}</div>
                            <div className="user-role">{doctorData?.specialty || 'Specialist'}</div>
                        </div>
                        <div className="avatar">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData?.name || 'Doctor')}&background=0d9488&color=fff`} alt="User" style={{ width: '100%' }} />
                        </div>
                        {onLogout && (
                            <button onClick={onLogout} className="btn-logout" title="Logout">
                                ⎋
                            </button>
                        )}
                    </div>
                </header>

                {/* DASHBOARD VIEW */}
                {view === 'dashboard' && (
                    <div className="page-view">
                        <div className="page-header">
                            <h1 className="page-title">Today's Overview</h1>
                            <div className="pending-count">{new Date().toDateString()}</div>
                        </div>

                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="stat-card">
                                <div className="stat-label">Total Appointments</div>
                                <div className="stat-value">{appointments.length}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Pending Reviews</div>
                                <div className="stat-value text-red">{records.length}</div>
                            </div>
                        </div>

                        <div className="table-container">
                            <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                                Appointment Queue
                            </div>
                            <table>
                                <thead><tr><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {appointments.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.appointment_time}</td>
                                            <td>{a.doctor_name || 'Walk-in'}</td>
                                            <td>{a.doctor_specialty || 'Routine Checkup'}</td>
                                            <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>{a.status.toUpperCase()}</span></td>
                                            <td>
                                                {a.status === 'confirmed' && (
                                                    <button className="btn-action btn-primary" onClick={() => handleCompleteAppt(a.id)}>Mark Done</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {appointments.length === 0 && <tr><td colSpan="5" style={{ padding: 20, textAlign: 'center' }}>No appointments.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RECORDS VIEW */}
                {view === 'records' && (
                    <div className="page-view">
                        <div className="page-header">
                            <h1 className="page-title">Incoming Records Queue</h1>
                            <div className="pending-count">{records.length} items pending</div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Summary</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {renderRecordsTable()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MESSAGES VIEW */}
                {view === 'messages' && (
                    <div className="page-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', overflow: 'hidden' }}>
                            <div className="msg-sidebar">
                                <div className="msg-list">
                                    <div className="msg-item active">
                                        <div style={{ fontWeight: 600 }}>Simulated Patient</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Active Session</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="msg-body">
                                    {messages.map((m, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'doctor' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                                            <div className={m.sender === 'doctor' ? 'msg-bubble-out' : 'msg-bubble-in'}>
                                                <div>{m.message}</div>
                                                <div style={{ fontSize: 10, textAlign: 'right', marginTop: 4, opacity: 0.8 }}>
                                                    {new Date(m.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a reply..."
                                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}
                                    />
                                    <button onClick={handleSendMessage} className="btn-action btn-primary">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* APPOINTMENTS VIEW */}
                {view === 'appointments' && (
                    <div className="page-view">
                        <div className="page-header">
                            <h1 className="page-title">Appointment Calendar</h1>
                            <div className="pending-count">{appointments.length} Total</div>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="card" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
                                <h3>No appointments scheduled</h3>
                                <p>New appointments will appear here automatically.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Group appointments by date */}
                                {[...new Set(appointments.map(a => a.appointment_date))].sort().map(date => (
                                    <div key={date}>
                                        <h3 style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: '#64748b',
                                            marginBottom: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            <span>📅</span>
                                            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </h3>

                                        <div style={{ display: 'grid', gap: 12 }}>
                                            {appointments
                                                .filter(a => a.appointment_date === date)
                                                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                                .map(appt => (
                                                    <div key={appt.id} className="card" style={{
                                                        padding: 16,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16,
                                                        borderLeft: appt.is_urgent ? '4px solid #ef4444' : '4px solid #0d9488'
                                                    }}>
                                                        <div style={{
                                                            fontSize: 18,
                                                            fontWeight: 700,
                                                            color: '#334155',
                                                            minWidth: 80
                                                        }}>
                                                            {appt.appointment_time}
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: 16 }}>
                                                                {appt.patient_name || 'Patient'}
                                                                {appt.is_urgent && (
                                                                    <span style={{
                                                                        background: '#fee2e2',
                                                                        color: '#b91c1c',
                                                                        fontSize: 11,
                                                                        padding: '2px 6px',
                                                                        borderRadius: 4,
                                                                        marginLeft: 8
                                                                    }}>URGENT</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: 13, color: '#64748b' }}>
                                                                Confirmation: {appt.confirmation_number}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: appt.status === 'confirmed' ? '#dcfce7' : '#f1f5f9',
                                                            color: appt.status === 'confirmed' ? '#166534' : '#64748b',
                                                            padding: '4px 12px',
                                                            borderRadius: 12,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {appt.status}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
