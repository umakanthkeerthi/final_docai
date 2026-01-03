import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentBooking from './AppointmentBooking';

// Mock upcoming appointments
const MOCK_UPCOMING_APPOINTMENTS = [
    {
        id: 'appt_1',
        doctor: {
            name: 'Dr. Sarah Chen',
            specialty: 'Primary Care',
            profile_image: '👩‍⚕️',
            location: { address: 'Apollo Hospital, Jubilee Hills' }
        },
        date: '2026-01-04',
        time: '10:00',
        status: 'confirmed',
        confirmationNumber: 'CONF-20260104-001'
    },
    {
        id: 'appt_2',
        doctor: {
            name: 'Dr. Rajesh Kumar',
            specialty: 'Cardiology',
            profile_image: '👨‍⚕️',
            location: { address: 'Care Hospital, Banjara Hills' }
        },
        date: '2026-01-06',
        time: '15:00',
        status: 'confirmed',
        confirmationNumber: 'CONF-20260106-002'
    }
];

// Mock past appointments
const MOCK_PAST_APPOINTMENTS = [
    {
        id: 'appt_past_1',
        doctor: {
            name: 'Dr. Priya Sharma',
            specialty: 'Dermatology',
            profile_image: '👩‍⚕️'
        },
        date: '2025-12-15',
        time: '14:00',
        status: 'completed'
    },
    {
        id: 'appt_past_2',
        doctor: {
            name: 'Dr. Anil Reddy',
            specialty: 'Orthopedics',
            profile_image: '👨‍⚕️'
        },
        date: '2025-11-20',
        time: '11:00',
        status: 'completed'
    }
];

export default function DoctorProfile() {
    const { t } = useTranslation();
    const [showBooking, setShowBooking] = useState(false);
    const [upcomingAppointments] = useState(MOCK_UPCOMING_APPOINTMENTS);
    const [pastAppointments] = useState(MOCK_PAST_APPOINTMENTS);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    if (showBooking) {
        return <AppointmentBooking onBack={() => setShowBooking(false)} />;
    }

    return (
        <section className="view-section active-view" style={{ gap: 20 }}>
            {/* Book New Appointment Button */}
            <button
                onClick={() => setShowBooking(true)}
                style={{
                    background: 'linear-gradient(135deg, var(--primary-teal) 0%, #007A8E 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 16,
                    padding: '20px 24px',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    boxShadow: '0 4px 12px rgba(0, 135, 158, 0.3)',
                    transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 135, 158, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 135, 158, 0.3)';
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                {t('appointments.bookNow')}
            </button>

            {/* Upcoming Appointments */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 16 }}>
                    {t('appointments.upcomingAppointments')}
                </h2>

                {upcomingAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {upcomingAppointments.map((appt) => (
                            <div key={appt.id} className="card" style={{
                                padding: 20,
                                borderLeft: '4px solid var(--primary-teal)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Status Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    background: '#DEF7EC',
                                    color: '#03543F',
                                    padding: '4px 10px',
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    ✓ {appt.status}
                                </div>

                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        background: 'var(--primary-teal-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 28,
                                        flexShrink: 0
                                    }}>
                                        {appt.doctor.profile_image}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700 }}>
                                            {appt.doctor.name}
                                        </h3>
                                        <div style={{ fontSize: 13, color: 'var(--primary-teal)', fontWeight: 600, marginBottom: 4 }}>
                                            {appt.doctor.specialty}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                                            {formatDate(appt.date)} • {formatTime(appt.time)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: 8,
                                    paddingTop: 12,
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: 10,
                                        border: '1px solid var(--primary-teal)',
                                        background: 'white',
                                        color: 'var(--primary-teal)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        📍 Directions
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: 'var(--primary-teal)',
                                        color: 'white',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        ℹ️ Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: 40,
                        background: '#f8f9fa'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                        <div style={{ fontSize: 15, color: 'var(--text-soft)' }}>
                            {t('appointments.noUpcoming')}
                        </div>
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 16 }}>
                    {t('appointments.pastAppointments')}
                </h2>

                {pastAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {pastAppointments.map((appt) => (
                            <div key={appt.id} className="card" style={{
                                padding: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                background: 'white',
                                opacity: 0.9
                            }}>
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                    flexShrink: 0
                                }}>
                                    {appt.doctor.profile_image}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-dark)' }}>
                                        {appt.doctor.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>
                                        {appt.doctor.specialty} • {formatDate(appt.date)}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowBooking(true)}
                                    style={{
                                        background: 'var(--primary-teal-light)',
                                        color: 'var(--primary-teal)',
                                        border: 'none',
                                        padding: '8px 14px',
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {t('appointments.bookAgain')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: 40,
                        background: '#f8f9fa'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                        <div style={{ fontSize: 15, color: 'var(--text-soft)' }}>
                            {t('appointments.noPast')}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
