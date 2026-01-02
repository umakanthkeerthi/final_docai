import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MedicationView() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('current'); // current, history

    const currentMeds = [
        {
            id: 1,
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Twice daily',
            timing: ['8:00 AM', '8:00 PM'],
            duration: '7 days',
            daysLeft: 3,
            prescribedBy: 'Dr. Sarah Chen',
            instructions: 'Take with food'
        },
        {
            id: 2,
            name: 'Vitamin D3',
            dosage: '1000 IU',
            frequency: 'Once daily',
            timing: ['9:00 AM'],
            duration: 'Ongoing',
            daysLeft: null,
            prescribedBy: 'Dr. Anika Patel',
            instructions: 'Take after breakfast'
        }
    ];

    const medicationHistory = [
        {
            id: 3,
            name: 'Ibuprofen',
            dosage: '400mg',
            period: 'Nov 10 - Nov 15, 2024',
            prescribedBy: 'Dr. Sarah Chen',
            status: 'Completed'
        },
        {
            id: 4,
            name: 'Cetirizine',
            dosage: '10mg',
            period: 'Oct 5 - Oct 12, 2024',
            prescribedBy: 'Dr. Anika Patel',
            status: 'Completed'
        }
    ];

    return (
        <section className="view-section active-view" style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                    {t('medication.title')}
                </h1>
                <p style={{ fontSize: 14, color: '#718096', margin: '5px 0 0 0' }}>
                    {t('medication.subtitle')}
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 24
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 12,
                    padding: '16px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{currentMeds.length}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{t('medication.activeMeds')}</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 12,
                    padding: '16px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>4</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{t('medication.dueToday')}</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: 12,
                    padding: '16px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>98%</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{t('medication.adherence')}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 20,
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: 0
            }}>
                <button
                    onClick={() => setActiveTab('current')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '12px 20px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: activeTab === 'current' ? '#3182ce' : '#718096',
                        borderBottom: activeTab === 'current' ? '3px solid #3182ce' : '3px solid transparent',
                        marginBottom: -2
                    }}
                >
                    {t('medication.current')}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '12px 20px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: activeTab === 'history' ? '#3182ce' : '#718096',
                        borderBottom: activeTab === 'history' ? '3px solid #3182ce' : '3px solid transparent',
                        marginBottom: -2
                    }}
                >
                    {t('medication.history')}
                </button>
            </div>

            {/* Current Medications */}
            {activeTab === 'current' && (
                <div>
                    {currentMeds.map((med) => (
                        <div
                            key={med.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 16,
                                padding: 18,
                                marginBottom: 16,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                                        {med.name}
                                    </h3>
                                    <p style={{ fontSize: 14, color: '#718096', margin: '4px 0 0 0' }}>
                                        {med.dosage} • {med.frequency}
                                    </p>
                                </div>
                                {med.daysLeft && (
                                    <span style={{
                                        background: med.daysLeft <= 3 ? '#fee2e2' : '#e6fffa',
                                        color: med.daysLeft <= 3 ? '#c53030' : '#285e61',
                                        padding: '4px 10px',
                                        borderRadius: 12,
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {med.daysLeft} {t('medication.daysLeft')}
                                    </span>
                                )}
                            </div>

                            {/* Timing Pills */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                {med.timing.map((time, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            background: '#f0f9ff',
                                            color: '#1e40af',
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: 600
                                        }}
                                    >
                                        🕐 {time}
                                    </span>
                                ))}
                            </div>

                            {/* Details */}
                            <div style={{
                                background: '#f7fafc',
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 12
                            }}>
                                <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 6 }}>
                                    <strong>{t('medication.instructions')}:</strong> {med.instructions}
                                </div>
                                <div style={{ fontSize: 13, color: '#4a5568' }}>
                                    <strong>{t('medication.prescribedBy')}:</strong> {med.prescribedBy}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{
                                    flex: 1,
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    ✓ {t('medication.markTaken')}
                                </button>
                                <button style={{
                                    background: '#f7fafc',
                                    color: '#4a5568',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    padding: '10px 16px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    ⏰ {t('medication.remind')}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Medication Button */}
                    <button style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        padding: '16px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 8
                    }}>
                        + {t('medication.addNew')}
                    </button>
                </div>
            )}

            {/* Medication History */}
            {activeTab === 'history' && (
                <div>
                    {medicationHistory.map((med) => (
                        <div
                            key={med.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 14,
                                padding: 16,
                                marginBottom: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                                    {med.name}
                                </h3>
                                <p style={{ fontSize: 13, color: '#718096', margin: '4px 0' }}>
                                    {med.dosage} • {med.period}
                                </p>
                                <p style={{ fontSize: 12, color: '#a0aec0', margin: '4px 0 0 0' }}>
                                    Prescribed by {med.prescribedBy}
                                </p>
                            </div>
                            <span style={{
                                background: '#d4f4dd',
                                color: '#22543d',
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600
                            }}>
                                ✓ {med.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
