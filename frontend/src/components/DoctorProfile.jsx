import React from 'react';

export default function DoctorProfile({ onStartChat }) {
    // Mock Data
    const previousDoctors = [
        { name: "Dr. Sarah Chen", spec: "Primary Care (PCP)", last: "Nov 15", img: "👩‍⚕️" },
        { name: "Dr. Anika Patel", spec: "Dermatology", last: "Aug 10", img: "🧑‍⚕️" }
    ];

    return (
        <section className="view-section active-view" style={{ padding: '20px', background: '#f8fafc', height: '100%' }}>

            {/* 1. Upcoming Appointment Card */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 15 }}>Upcoming Appointment</h2>

            <div className="card" style={{
                padding: '20px',
                marginBottom: 30,
                borderLeft: '5px solid var(--primary-teal)',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 15
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-dark)' }}>Video Follow-up</div>
                        <div style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 4 }}>Tomorrow, Dec 26 • 10:00 AM</div>
                    </div>
                    <div style={{ fontSize: 40 }}>👩‍⚕️</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <span style={{ background: '#e6fffa', color: '#285e61', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        Confirmed with Dr. Chen
                    </span>
                    <button style={{ background: '#edf2f7', border: 'none', padding: '8px 16px', borderRadius: 8, color: 'var(--text-dark)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Join Link
                    </button>
                </div>
            </div>

            {/* 2. Previously Consulted List */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 15 }}>Previously Consulted</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {previousDoctors.map((doc, i) => (
                    <div key={i} className="card" style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 15,
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        {/* Avatar */}
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            {doc.img}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-dark)' }}>{doc.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>{doc.spec} • Last visit: {doc.last}</div>
                        </div>

                        {/* Button */}
                        <button style={{ background: '#e6fffa', color: '#319795', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                            Book Again
                        </button>
                    </div>
                ))}
            </div>

        </section>
    );
}
