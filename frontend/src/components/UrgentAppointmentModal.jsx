import React from 'react';
import { useTranslation } from 'react-i18next';

export default function UrgentAppointmentModal({ doctor, selectedTime, onConfirm, onCancel }) {
    const { t } = useTranslation();

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={onCancel}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        maxWidth: 450,
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'slideUp 0.3s ease-out',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent-red) 0%, #B91C1C 100%)',
                        padding: '24px 24px 20px 24px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                            Confirm Urgent Appointment
                        </h2>
                        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9 }}>
                            Emergency booking for today
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: 24 }}>
                        {/* Doctor Info */}
                        <div style={{
                            display: 'flex',
                            gap: 16,
                            padding: 16,
                            background: '#FEF2F2',
                            borderRadius: 12,
                            marginBottom: 20,
                            border: '1px solid #FEE2E2'
                        }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                flexShrink: 0
                            }}>
                                {doctor.profile_image}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: 'var(--text-dark)' }}>
                                    {doctor.name}
                                </h3>
                                <div style={{ fontSize: 14, color: 'var(--accent-red)', fontWeight: 600, marginBottom: 4 }}>
                                    {doctor.specialty}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                                    {doctor.qualifications}
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: '#FEF2F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18
                                }}>
                                    📅
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 2 }}>Date</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                                        Today, {getTodayDate()}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: '#FEF2F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18
                                }}>
                                    ⏰
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 2 }}>Time</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>
                                        {formatTime(selectedTime)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: '#FEF2F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18
                                }}>
                                    📍
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 2 }}>Location</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>
                                        {doctor.location.address}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: '#FEF2F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18
                                }}>
                                    💰
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 2 }}>Consultation Fee</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-teal)' }}>
                                        ₹{doctor.consultation_fee}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning Note */}
                        <div style={{
                            background: '#FEF3C7',
                            border: '1px solid #FDE68A',
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 20,
                            display: 'flex',
                            gap: 10
                        }}>
                            <div style={{ fontSize: 16 }}>⚡</div>
                            <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                                This is an urgent appointment. Please arrive 10 minutes early.
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    borderRadius: 12,
                                    border: '2px solid #e5e7eb',
                                    background: 'white',
                                    color: 'var(--text-dark)',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--accent-red) 0%, #B91C1C 100%)',
                                    color: 'white',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                                }}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
