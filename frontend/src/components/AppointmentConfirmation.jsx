import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AppointmentConfirmation({ booking, onBack }) {
    const { t } = useTranslation();

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <section className="view-section active-view" style={{ gap: 20 }}>
            {/* Success Animation */}
            <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                animation: 'fadeInScale 0.5s ease-out'
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                }}>
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    margin: '0 0 8px 0'
                }}>
                    {t('appointments.bookingConfirmed')}
                </h1>
                <p style={{
                    fontSize: 15,
                    color: 'var(--text-soft)',
                    margin: 0
                }}>
                    Your appointment has been successfully scheduled
                </p>
            </div>

            {/* Confirmation Number */}
            <div className="card" style={{
                background: 'var(--primary-teal-light)',
                border: '2px dashed var(--primary-teal)',
                textAlign: 'center',
                padding: 20
            }}>
                <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 4 }}>
                    {t('appointments.confirmationNumber')}
                </div>
                <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--primary-teal)',
                    letterSpacing: 2,
                    fontFamily: 'monospace'
                }}>
                    {booking.confirmationNumber}
                </div>
            </div>

            {/* Appointment Details */}
            <div className="card">
                <h3 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '0 0 20px 0',
                    color: 'var(--text-dark)'
                }}>
                    {t('appointments.appointmentDetails')}
                </h3>

                {/* Doctor Info */}
                <div style={{
                    display: 'flex',
                    gap: 16,
                    padding: 16,
                    background: '#f8f9fa',
                    borderRadius: 12,
                    marginBottom: 20
                }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'var(--primary-teal-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        flexShrink: 0
                    }}>
                        {booking.doctor.profile_image}
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700 }}>
                            {booking.doctor.name}
                        </h4>
                        <div style={{ fontSize: 14, color: 'var(--primary-teal)', fontWeight: 600, marginBottom: 4 }}>
                            {booking.doctor.specialty}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                            {booking.doctor.qualifications}
                        </div>
                    </div>
                </div>

                {/* Date & Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'var(--primary-teal-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 4 }}>
                                Date
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                                {formatDate(booking.date)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'var(--primary-teal-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 4 }}>
                                Time
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                                {formatTime(booking.time)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'var(--primary-teal-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 4 }}>
                                Location
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                                {booking.doctor.location.address}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 2 }}>
                                {booking.doctor.location.city}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: '#FFF7ED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 4 }}>
                                Consultation Fee
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-amber)' }}>
                                ₹{booking.doctor.consultation_fee}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notes */}
            <div className="card" style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D'
            }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>ℹ️</div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>
                            Important Information
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6 }}>
                            <li>Please arrive 10 minutes before your appointment time</li>
                            <li>Bring any previous medical records or prescriptions</li>
                            <li>Carry a valid ID proof</li>
                            <li>You will receive a reminder SMS 24 hours before the appointment</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <button
                    className="cta-button"
                    onClick={() => {
                        alert('Directions feature coming soon!');
                    }}
                >
                    📍 Get Directions
                </button>
                <button
                    className="cta-button secondary"
                    onClick={onBack}
                >
                    ← Back to Home
                </button>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
                    }
                }
            `}</style>
        </section>
    );
}
