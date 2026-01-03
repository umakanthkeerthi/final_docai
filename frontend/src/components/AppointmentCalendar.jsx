import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AppointmentConfirmation from './AppointmentConfirmation';

// Helper function to get doctor's Firebase UID via API
const getDoctorUid = async (doctorId) => {
    try {
        const response = await fetch(`http://localhost:8002/api/doctor/uid/${doctorId}`);
        const data = await response.json();

        if (data.success && data.uid) {
            console.log(`✅ Got doctor UID for ${doctorId}:`, data.uid);
            return data.uid;
        }

        console.error(`❌ Failed to get doctor UID for ${doctorId}:`, data.error);
        return null;
    } catch (error) {
        console.error('❌ Error fetching doctor UID:', error);
        return null;
    }
};

// Mock available slots for the next 7 days
const generateMockSlots = (isUrgent) => {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dateStr = date.toISOString().split('T')[0];
        const daySlots = [];

        const isToday = i === 0;

        // For non-emergency, limit today's slots to 1-2
        // For other days or emergency, show all slots
        const shouldLimitSlots = !isUrgent && isToday;

        // Morning slots (9 AM - 12 PM)
        if (i > 0 || date.getHours() < 9) {
            const morningSlots = [
                { time: '09:00', period: 'Morning', available: Math.random() > 0.3 },
                { time: '10:00', period: 'Morning', available: Math.random() > 0.3 },
                { time: '11:00', period: 'Morning', available: Math.random() > 0.3 }
            ];

            if (shouldLimitSlots) {
                // Show only first available slot for today
                const availableSlot = morningSlots.find(s => s.available);
                if (availableSlot) daySlots.push(availableSlot);
            } else {
                daySlots.push(...morningSlots);
            }
        }

        // Afternoon slots (2 PM - 5 PM)
        const afternoonSlots = [
            { time: '14:00', period: 'Afternoon', available: Math.random() > 0.3 },
            { time: '15:00', period: 'Afternoon', available: Math.random() > 0.3 },
            { time: '16:00', period: 'Afternoon', available: Math.random() > 0.3 }
        ];

        if (shouldLimitSlots) {
            // Show only first available afternoon slot for today (if we don't have 2 slots yet)
            if (daySlots.length < 2) {
                const availableSlot = afternoonSlots.find(s => s.available);
                if (availableSlot) daySlots.push(availableSlot);
            }
        } else {
            daySlots.push(...afternoonSlots);
        }

        // Evening slots (6 PM - 8 PM)
        const eveningSlots = [
            { time: '18:00', period: 'Evening', available: Math.random() > 0.3 },
            { time: '19:00', period: 'Evening', available: Math.random() > 0.3 }
        ];

        if (shouldLimitSlots) {
            // Don't add evening slots for today in non-emergency (keep it to 1-2 slots max)
        } else {
            daySlots.push(...eveningSlots);
        }

        slots.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-IN', { month: 'short' }),
            slots: daySlots
        });
    }

    return slots;
};

export default function AppointmentCalendar({ doctor, onBack, isUrgent }) {
    const { t } = useTranslation();


    // Safety check - if no doctor provided, show error
    if (!doctor) {
        console.error('❌ AppointmentCalendar: doctor prop is required');
        return (
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                <p style={{ color: 'var(--error-red)' }}>Error: Doctor information not available</p>
                <button className="cta-button" onClick={onBack} style={{ marginTop: 16 }}>
                    Go Back
                </button>
            </div>
        );
    }

    console.log('✅ AppointmentCalendar mounted successfully');
    console.log('📋 Doctor:', doctor.name);
    console.log('📋 isUrgent:', isUrgent);

    const [availableSlots] = useState(generateMockSlots(isUrgent));

    // Pre-select date based on urgency: today for urgent, tomorrow for non-urgent
    const defaultDateIndex = isUrgent ? 0 : 1; // 0 = today, 1 = tomorrow
    const [selectedDate, setSelectedDate] = useState(availableSlots[defaultDateIndex]?.date || availableSlots[0].date);
    const [selectedTime, setSelectedTime] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const selectedDaySlots = availableSlots.find(day => day.date === selectedDate);

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleConfirmBooking = async () => {
        const booking = {
            doctor,
            date: selectedDate,
            time: selectedTime,
            confirmationNumber: `CONF-${Date.now().toString().slice(-8)}`
        };

        // Try to save to Firebase (fails silently if unavailable)
        try {
            const API_BASE = 'http://localhost:8002/api';
            const currentUser = { uid: 'guest' }; // Replace with actual auth
            const currentProfile = { id: 'default' }; // Replace with actual profile

            // Fetch doctor's Firebase UID
            // Direct access to Firebase UID from doctor object
            console.log('🔍 Selected Doctor Object:', doctor);
            console.log('🔍 Doctor has firebase_uid?', 'firebase_uid' in doctor);
            console.log('🔍 firebase_uid value:', doctor.firebase_uid);

            let doctorUid = doctor.firebase_uid;
            console.log(`📋 Doctor UID from DB for ${doctor.name}:`, doctorUid);

            // If doctor_uid is missing, try to get it from the API as fallback
            if (!doctorUid) {
                console.warn('⚠️ firebase_uid missing from doctor object, trying API fallback...');
                doctorUid = await getDoctorUid(doctor.id);
                console.log('📋 Got UID from API:', doctorUid);
            }

            // Final validation - MUST have doctor_uid
            if (!doctorUid) {
                console.error('❌ CRITICAL: Could not get doctor_uid!');
                alert('System Error: Unable to link appointment to doctor. Please refresh the page and try again.');
                return;
            }
            console.log('✅ Final doctor_uid to send:', doctorUid);

            const response = await fetch(`${API_BASE}/appointments/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.uid,
                    profile_id: currentProfile.id,
                    doctor_id: doctor.id,
                    doctor_uid: doctorUid, // ← NEW: Firebase UID for doctor dashboard
                    doctor_name: doctor.name,
                    doctor_specialty: doctor.specialty,
                    doctor_location: doctor.location,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    consultation_fee: doctor.consultation_fee,
                    is_urgent: isUrgent || false,
                    status: 'confirmed'
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Appointment saved to Firebase:', data.confirmation_number);
                // Update booking with real confirmation number from backend
                booking.confirmationNumber = data.confirmation_number;
            } else {
                const errorText = await response.text();
                console.error('❌ Firebase save failed:', response.status, errorText);
                console.log('⚠️ Continuing with local confirmation');
            }
        } catch (error) {
            console.error('❌ Appointment booking error:', error);
            console.log('⚠️ Firebase unavailable, continuing with mock data');
        }

        // Always show confirmation (works regardless of Firebase)
        setBookingData(booking);
        setShowConfirmation(true);
    };

    if (showConfirmation && bookingData) {
        return <AppointmentConfirmation booking={bookingData} onBack={onBack} />;
    }

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <section className="view-section active-view" style={{ gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-teal)',
                        cursor: 'pointer',
                        padding: 8,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="card-title" style={{ margin: 0 }}>{t('appointments.selectSlot')}</h1>
            </div>

            {/* Doctor Info Card */}
            <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'var(--primary-teal-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28
                    }}>
                        {doctor.profile_image}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{doctor.name}</h3>
                        <div style={{ fontSize: 13, color: 'var(--primary-teal)', fontWeight: 600, marginTop: 2 }}>
                            {doctor.specialty}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>
                            {doctor.location.address}
                        </div>
                    </div>
                    <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--primary-teal)'
                    }}>
                        ₹{doctor.consultation_fee}
                    </div>
                </div>
            </div>

            {/* Date Selection */}
            <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-dark)' }}>
                    Select Date
                </h3>
                <div style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 8,
                    scrollbarWidth: 'none'
                }}>
                    {availableSlots.map((day, index) => {
                        const isSelected = selectedDate === day.date;
                        const isToday = index === 0;

                        return (
                            <button
                                key={day.date}
                                onClick={() => {
                                    setSelectedDate(day.date);
                                    setSelectedTime(null);
                                }}
                                style={{
                                    minWidth: 70,
                                    padding: '12px 8px',
                                    borderRadius: 12,
                                    border: isSelected ? '2px solid var(--primary-teal)' : '1px solid #e2e8f0',
                                    background: isSelected ? 'var(--primary-teal-light)' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                {isToday && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -6,
                                        right: -6,
                                        background: 'var(--accent-amber)',
                                        color: 'white',
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: 8
                                    }}>
                                        TODAY
                                    </div>
                                )}
                                <div style={{
                                    fontSize: 12,
                                    color: isSelected ? 'var(--primary-teal)' : 'var(--text-soft)',
                                    fontWeight: 600
                                }}>
                                    {day.dayName}
                                </div>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: isSelected ? 'var(--primary-teal)' : 'var(--text-dark)'
                                }}>
                                    {day.dayNum}
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: isSelected ? 'var(--primary-teal)' : 'var(--text-soft)'
                                }}>
                                    {day.month}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots by Period */}
            {selectedDaySlots && (
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-dark)' }}>
                        Available Time Slots
                    </h3>

                    {/* Group slots by period */}
                    {['Morning', 'Afternoon', 'Evening'].map(period => {
                        const periodSlots = selectedDaySlots.slots.filter(slot => slot.period === period);
                        if (periodSlots.length === 0) return null;

                        return (
                            <div key={period} style={{ marginBottom: 20 }}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--text-soft)',
                                    marginBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    {period === 'Morning' && '🌅'}
                                    {period === 'Afternoon' && '☀️'}
                                    {period === 'Evening' && '🌙'}
                                    {period}
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                    gap: 8
                                }}>
                                    {periodSlots.map(slot => {
                                        const isSelected = selectedTime === slot.time;
                                        const isAvailable = slot.available;

                                        return (
                                            <button
                                                key={slot.time}
                                                onClick={() => isAvailable && handleTimeSelect(slot.time)}
                                                disabled={!isAvailable}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: 10,
                                                    border: isSelected ? '2px solid var(--primary-teal)' : '1px solid #e2e8f0',
                                                    background: isSelected ? 'var(--primary-teal)' :
                                                        isAvailable ? 'white' : '#f8f9fa',
                                                    color: isSelected ? 'white' :
                                                        isAvailable ? 'var(--text-dark)' : 'var(--text-soft)',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.2s',
                                                    opacity: isAvailable ? 1 : 0.5
                                                }}
                                            >
                                                {formatTime(slot.time)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirm Button */}
            {selectedTime && (
                <button
                    onClick={handleConfirmBooking}
                    className="cta-button"
                    style={{
                        marginTop: 16,
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {t('appointments.confirmBooking')} - {formatTime(selectedTime)}
                </button>
            )}

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}
