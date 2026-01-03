import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentConfirmation from './AppointmentConfirmation';
import UrgentAppointmentModal from './UrgentAppointmentModal';
import { DOCTORS_DATABASE } from '../data/doctors';

// Use comprehensive doctor database
const MOCK_DOCTORS = DOCTORS_DATABASE;

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

const SPECIALTIES = [
    'All Specialties',
    'Primary Care',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Neurology',
    'Gynecology'
];

// Map symptoms/conditions to relevant specialties
const getRelevantSpecialty = (triageResult) => {
    if (!triageResult) return null;

    const symptomText = (triageResult.reason || '').toLowerCase();
    const condition = (triageResult.matched_condition || '').toLowerCase();
    const combinedText = `${symptomText} ${condition}`;

    // Cardiology keywords
    if (combinedText.match(/chest|heart|cardiac|blood pressure|hypertension|palpitation/i)) {
        return 'Cardiology';
    }
    // Dermatology keywords
    if (combinedText.match(/skin|rash|acne|eczema|dermat|itch/i)) {
        return 'Dermatology';
    }
    // Orthopedics keywords
    if (combinedText.match(/bone|fracture|joint|arthritis|back pain|spine|orthopedic/i)) {
        return 'Orthopedics';
    }
    // Pediatrics keywords
    if (combinedText.match(/child|infant|baby|pediatric|kid/i)) {
        return 'Pediatrics';
    }
    // Neurology keywords
    if (combinedText.match(/headache|migraine|seizure|neurolog|dizz|vertigo/i)) {
        return 'Neurology';
    }

    // Default to Primary Care
    return 'Primary Care';
};

export default function AppointmentBooking({ onBack, triageResult, isUrgent }) {
    const { t } = useTranslation();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    // Get recommended specialty based on triage
    const recommendedSpecialty = getRelevantSpecialty(triageResult);

    // Filter and sort doctors based on urgency and condition
    const getFilteredDoctors = () => {
        let filtered = [...MOCK_DOCTORS]; // Show all doctors

        if (isUrgent) {
            // Emergency: Sort by earliest availability (today first)
            filtered.sort((a, b) => {
                const dateA = new Date(a.next_available);
                const dateB = new Date(b.next_available);
                return dateA - dateB;
            });
        } else {
            // Non-emergency: Prioritize recommended specialty, then by rating
            filtered.sort((a, b) => {
                // First, prioritize recommended specialty
                const aIsRecommended = a.specialty === recommendedSpecialty;
                const bIsRecommended = b.specialty === recommendedSpecialty;

                if (aIsRecommended && !bIsRecommended) return -1;
                if (!aIsRecommended && bIsRecommended) return 1;

                // Then sort by rating
                return b.rating - a.rating;
            });
        }

        return filtered;
    };

    const filteredDoctors = getFilteredDoctors();

    // Handle slot click for emergency (opens modal)
    const handleSlotClick = (doctor, time) => {
        setSelectedDoctor(doctor);
        setSelectedTime(time);
        setShowModal(true);
    };

    // Handle doctor click for non-emergency (opens calendar)
    const handleDoctorClick = (doctor) => {
        if (!isUrgent) {
            setSelectedDoctor(doctor);
            setShowCalendar(true);
        }
    };

    // Handle modal confirmation
    const handleConfirmUrgent = async () => {
        console.log('🚀 handleConfirmUrgent called');
        console.log('🚀 selectedDoctor:', selectedDoctor);
        console.log('🚀 selectedDoctor.id:', selectedDoctor?.id);
        console.log('🚀 selectedDoctor.firebase_uid:', selectedDoctor?.firebase_uid);

        const today = new Date();
        const booking = {
            doctor: selectedDoctor,
            date: today.toISOString().split('T')[0],
            time: selectedTime,
            confirmationNumber: `URG-${Date.now().toString().slice(-8)}`
        };

        // Try to save to Firebase (fails silently if unavailable)
        try {
            const API_BASE = 'http://localhost:8002/api';
            const currentUser = { uid: 'guest' }; // Replace with actual auth
            const currentProfile = { id: 'default' }; // Replace with actual profile

            // Fetch doctor's Firebase UID
            // Direct access to Firebase UID from doctor object
            console.log('🔍 Selected Doctor Object:', selectedDoctor);
            console.log('🔍 Doctor has firebase_uid?', 'firebase_uid' in selectedDoctor);
            console.log('🔍 firebase_uid value:', selectedDoctor.firebase_uid);

            let doctorUid = selectedDoctor.firebase_uid;
            console.log(`📋 Doctor UID from DB for ${selectedDoctor.name}:`, doctorUid);

            // If doctor_uid is missing, try to get it from the API as fallback
            if (!doctorUid) {
                console.warn('⚠️ firebase_uid missing from doctor object, trying API fallback...');
                doctorUid = await getDoctorUid(selectedDoctor.id);
                console.log('📋 Got UID from API:', doctorUid);
            }

            // Final validation - MUST have doctor_uid
            if (!doctorUid) {
                console.error('❌ CRITICAL: Could not get doctor_uid!');
                alert('System Error: Unable to link appointment to doctor. Please refresh the page and try again.');
                return;
            }
            console.log('✅ Final doctor_uid to send:', doctorUid);

            const requestBody = {
                user_id: currentUser.uid,
                profile_id: currentProfile.id,
                doctor_id: selectedDoctor.id,
                doctor_uid: doctorUid, // ← NEW: Firebase UID for doctor dashboard
                doctor_name: selectedDoctor.name,
                doctor_specialty: selectedDoctor.specialty,
                doctor_location: selectedDoctor.location,
                appointment_date: booking.date,
                appointment_time: booking.time,
                consultation_fee: selectedDoctor.consultation_fee,
                is_urgent: true,
                status: 'confirmed'
            };

            console.log('📤 Sending appointment request:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`${API_BASE}/appointments/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
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
        setShowModal(false);
        setShowConfirmation(true);
    };

    const handleBackFromCalendar = () => {
        setShowCalendar(false);
        setSelectedDoctor(null);
    };

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Show confirmation screen
    if (showConfirmation && bookingData) {
        return <AppointmentConfirmation booking={bookingData} onBack={onBack} />;
    }

    // Show calendar for non-emergency
    if (showCalendar && selectedDoctor && !isUrgent) {
        return (
            <AppointmentCalendar
                doctor={selectedDoctor}
                onBack={handleBackFromCalendar}
                isUrgent={isUrgent}
            />
        );
    }

    return (
        <section className="view-section active-view" style={{ gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: isUrgent ? 'var(--accent-red)' : 'var(--primary-teal)',
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
                <div style={{ flex: 1 }}>
                    <h1 className="card-title" style={{ margin: 0, color: isUrgent ? 'var(--accent-red)' : 'var(--text-dark)' }}>
                        {isUrgent ? '⚠️ Urgent Appointment' : t('appointments.title')}
                    </h1>
                    {isUrgent && (
                        <div style={{ fontSize: 13, color: 'var(--accent-red)', marginTop: 4 }}>
                            Showing nearest doctors with earliest slots
                        </div>
                    )}
                    {!isUrgent && recommendedSpecialty && (
                        <div style={{ fontSize: 13, color: 'var(--primary-teal)', marginTop: 4 }}>
                            Recommended: {recommendedSpecialty} specialists near you
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 8 }}>
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available nearby
            </div>

            {/* Doctor Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredDoctors.map(doctor => (
                    <div
                        key={doctor.id}
                        className="card"
                        onClick={() => handleDoctorClick(doctor)}
                        style={{
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            padding: 20,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                        }}
                    >
                        {/* Doctor Info */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            {/* Avatar */}
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
                                {doctor.profile_image}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1 }}>
                                {/* Recommended Badge */}
                                {!isUrgent && doctor.specialty === recommendedSpecialty && (
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#DEF7EC',
                                        color: '#03543F',
                                        padding: '3px 10px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        marginBottom: 6,
                                        textTransform: 'uppercase'
                                    }}>
                                        ⭐ Recommended
                                    </div>
                                )}
                                {isUrgent && (
                                    <div style={{
                                        display: 'inline-block',
                                        background: 'var(--accent-red-light)',
                                        color: 'var(--accent-red)',
                                        padding: '3px 10px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        marginBottom: 6,
                                        textTransform: 'uppercase'
                                    }}>
                                        ⚠️ Urgent
                                    </div>
                                )}
                                <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>
                                    {doctor.name}
                                </h3>
                                <div style={{ fontSize: 14, color: 'var(--primary-teal)', fontWeight: 600, marginBottom: 4 }}>
                                    {doctor.specialty}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                                    {doctor.qualifications} • {doctor.experience_years} years exp.
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 4
                            }}>
                                <div style={{
                                    background: '#FFF7ED',
                                    color: 'var(--accent-amber)',
                                    padding: '4px 10px',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    ⭐ {doctor.rating}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                                    {doctor.review_count} reviews
                                </div>
                            </div>
                        </div>

                        {/* Location & Fee */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: 16,
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: 13, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {doctor.location.distance}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                                    {doctor.location.hospital}, {doctor.location.area}
                                </div>
                            </div>

                            <div style={{
                                textAlign: 'right',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4
                            }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-teal)' }}>
                                    ₹{doctor.consultation_fee}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                                    Consultation Fee
                                </div>
                            </div>
                        </div>

                        {/* Today's Slots (Emergency) or Next Available (Non-Emergency) */}
                        {isUrgent ? (
                            doctor.today_slots && doctor.today_slots.length > 0 ? (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--accent-red)', fontWeight: 600, marginBottom: 8 }}>
                                        Available Today:
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {doctor.today_slots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSlotClick(doctor, slot);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: 8,
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, var(--accent-red) 0%, #B91C1C 100%)',
                                                    color: 'white',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)';
                                                }}
                                            >
                                                {formatTime(slot)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    marginTop: 12,
                                    padding: '8px 12px',
                                    background: '#FEE2E2',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    color: '#991B1B',
                                    fontWeight: 600,
                                    textAlign: 'center'
                                }}>
                                    No slots available today
                                </div>
                            )
                        ) : (
                            <div style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                background: '#F0FDF4',
                                borderRadius: 8,
                                fontSize: 13,
                                color: '#166534',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>
                                    Next available: {new Date(doctor.next_available).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredDoctors.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: 'var(--text-soft)'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No doctors found</div>
                    <div style={{ fontSize: 14 }}>Try adjusting your search or filters</div>
                </div>
            )}

            {/* Urgent Appointment Modal */}
            {showModal && selectedDoctor && selectedTime && (
                <UrgentAppointmentModal
                    doctor={selectedDoctor}
                    selectedTime={selectedTime}
                    onConfirm={handleConfirmUrgent}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </section>
    );
}
