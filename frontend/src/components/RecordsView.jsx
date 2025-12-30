import React from 'react';

export default function RecordsView() {
    const records = [
        {
            id: 1,
            type: 'Consultation Summary',
            date: 'Dec 15, 2024',
            doctor: 'Dr. Sarah Chen',
            category: 'General Checkup',
            badge: 'summary'
        },
        {
            id: 2,
            type: 'Lab Report',
            date: 'Nov 28, 2024',
            doctor: 'PathLab Diagnostics',
            category: 'Blood Test',
            badge: 'report'
        },
        {
            id: 3,
            type: 'Prescription',
            date: 'Nov 20, 2024',
            doctor: 'Dr. Anika Patel',
            category: 'Skin Care',
            badge: 'prescription'
        }
    ];

    const getBadgeStyle = (badge) => {
        const styles = {
            summary: { bg: '#ebf8ff', color: '#2b6cb0' },
            report: { bg: '#faf5ff', color: '#6b46c1' },
            prescription: { bg: '#f0fff4', color: '#2f855a' }
        };
        return styles[badge] || styles.summary;
    };

    return (
        <section className="view-section active-view" style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                    Medical Records
                </h1>
                <p style={{ fontSize: 14, color: '#718096', margin: '5px 0 0 0' }}>
                    Your health history and documents
                </p>
            </div>

            {/* Upload Card */}
            <div style={{
                border: '2px dashed #3182ce',
                borderRadius: 16,
                padding: '32px 24px',
                textAlign: 'center',
                marginBottom: 24,
                background: '#f0f9ff',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: '#1a202c' }}>
                    Upload New Record
                </h3>
                <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                    Add prescriptions, lab reports, or medical documents
                </p>
            </div>

            {/* Records List */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a202c' }}>
                    Recent Records
                </h2>

                {records.map((record) => {
                    const badgeStyle = getBadgeStyle(record.badge);
                    return (
                        <div
                            key={record.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 14,
                                padding: 16,
                                marginBottom: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                {/* Icon */}
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    background: badgeStyle.bg,
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    flexShrink: 0
                                }}>
                                    {record.badge === 'summary' ? '📋' : record.badge === 'report' ? '🧪' : '💊'}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                                            {record.type}
                                        </h3>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: '3px 8px',
                                            borderRadius: 10,
                                            background: badgeStyle.bg,
                                            color: badgeStyle.color,
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {record.badge}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 13, color: '#718096', margin: '4px 0' }}>
                                        {record.doctor} • {record.category}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                        <span style={{ fontSize: 12, color: '#a0aec0' }}>
                                            📅 {record.date}
                                        </span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button style={{
                                                background: '#f7fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 6,
                                                padding: '5px 10px',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                color: '#4a5568'
                                            }}>
                                                View
                                            </button>
                                            <button style={{
                                                background: '#3182ce',
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '5px 10px',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                color: 'white'
                                            }}>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
