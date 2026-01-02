import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';
import FileUploadModal from './FileUploadModal';
import FileViewerModal from './FileViewerModal';

export default function RecordsView({ selectedProfile }) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingRecord, setViewingRecord] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, [currentUser, selectedProfile]);

    const fetchRecords = async () => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = selectedProfile?.id
                ? `${API_BASE}/records/${currentUser.uid}?profile_id=${selectedProfile.id}`
                : `${API_BASE}/records/${currentUser.uid}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setRecords(data.records || []);
            } else {
                setError(data.error || 'Failed to load records');
            }
        } catch (err) {
            console.error('Error fetching records:', err);
            setError('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!confirm(t('records.confirmDelete') || 'Are you sure you want to delete this record?')) return;

        try {
            const response = await fetch(`${API_BASE}/records/${recordId}?user_id=${currentUser.uid}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state
                setRecords(records.filter(r => r.id !== recordId));
            } else {
                alert(data.error || 'Failed to delete record');
            }
        } catch (err) {
            console.error('Error deleting record:', err);
            alert('Failed to delete record');
        }
    };

    const getBadgeStyle = (type, category) => {
        // Handle medical_file types with categories
        if (type === 'medical_file' && category) {
            const categoryStyles = {
                prescription: { bg: '#f0fff4', color: '#2f855a', icon: '💊', label: 'Prescription' },
                blood_test: { bg: '#fee2e2', color: '#991b1b', icon: '🩸', label: 'Blood Test' },
                xray: { bg: '#dbeafe', color: '#1e40af', icon: '🦴', label: 'X-Ray' },
                lab_report: { bg: '#ede9fe', color: '#5b21b6', icon: '🔬', label: 'Lab Report' },
                vaccination: { bg: '#fef3c7', color: '#92400e', icon: '💉', label: 'Vaccination' },
                discharge_summary: { bg: '#cffafe', color: '#155e75', icon: '📋', label: 'Discharge Summary' },
                other: { bg: '#f3f4f6', color: '#374151', icon: '📄', label: 'Document' }
            };
            return categoryStyles[category] || categoryStyles.other;
        }

        // Legacy types
        const styles = {
            summary: { bg: '#ebf8ff', color: '#2b6cb0', icon: '📋', label: 'Summary' },
            prescription: { bg: '#f0fff4', color: '#2f855a', icon: '💊', label: 'Prescription' }
        };
        return styles[type] || styles.summary;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <section className="view-section active-view" style={{ padding: '20px' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                            {t('records.title')}
                        </h1>
                        <p style={{ fontSize: 14, color: '#718096', margin: '5px 0 0 0' }}>
                            {selectedProfile ? `${t('records.recordsFor')} ${selectedProfile.name}` : t('records.yourHistory')}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            background: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 2px 4px rgba(49, 130, 206, 0.3)'
                        }}
                    >
                        <span>+</span> {t('records.upload')}
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                        <p>{t('records.loading')}</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 20,
                        color: '#991b1b'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && records.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: '#f9fafb',
                        borderRadius: 16,
                        border: '2px dashed #d1d5db'
                    }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>📁</div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', color: '#1a202c' }}>
                            {t('records.noRecords')}
                        </h3>
                        <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>
                            {t('records.uploadPrompt')}
                        </p>
                    </div>
                )}

                {/* Records List */}
                {!loading && records.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a202c' }}>
                            {t('records.recentRecords')} ({records.length})
                        </h2>

                        {records.map((record) => {
                            const badgeStyle = getBadgeStyle(record.type, record.data?.category);

                            // Determine display title
                            let displayTitle = 'Medical Record';
                            if (record.type === 'prescription') {
                                displayTitle = 'Prescription Analysis';
                            } else if (record.type === 'summary') {
                                displayTitle = 'Consultation Summary';
                            } else if (record.type === 'medical_file') {
                                displayTitle = badgeStyle.label;
                            }

                            // Determine subtitle
                            let subtitle = 'Medical record';
                            if (record.type === 'prescription') {
                                // Check for medicines in different possible locations
                                const medicines = record.data?.medicines || record.data?.data?.medicines || [];
                                if (medicines.length > 0) {
                                    subtitle = `${medicines.length} medicine${medicines.length > 1 ? 's' : ''}`;
                                } else {
                                    subtitle = 'Prescription analysis';
                                }
                            } else if (record.type === 'medical_file' && record.data?.filename) {
                                subtitle = record.data.filename;
                            } else if (record.data?.notes) {
                                subtitle = record.data.notes.substring(0, 50) + (record.data.notes.length > 50 ? '...' : '');
                            }

                            return (
                                <div
                                    key={record.id}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 14,
                                        padding: 16,
                                        marginBottom: 12,
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
                                            {badgeStyle.icon}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1a202c' }}>
                                                    {displayTitle}
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
                                                    {badgeStyle.label}
                                                </span>
                                            </div>

                                            <p style={{ fontSize: 13, color: '#718096', margin: '4px 0' }}>
                                                {subtitle}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                                <span style={{ fontSize: 12, color: '#a0aec0' }}>
                                                    📅 {formatDate(record.created_at)}
                                                </span>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {record.type === 'medical_file' && (
                                                        <button
                                                            onClick={() => setViewingRecord(record)}
                                                            style={{
                                                                background: '#dbeafe',
                                                                border: '1px solid #93c5fd',
                                                                borderRadius: 6,
                                                                padding: '5px 10px',
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                color: '#1e40af'
                                                            }}
                                                        >
                                                            👁️ {t('records.view')}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        style={{
                                                            background: '#fee2e2',
                                                            border: '1px solid #fca5a5',
                                                            borderRadius: 6,
                                                            padding: '5px 10px',
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            color: '#991b1b'
                                                        }}
                                                    >
                                                        {t('records.delete')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Upload Modal */}
            <FileUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                currentUser={currentUser}
                selectedProfile={selectedProfile}
                onUploadSuccess={() => {
                    fetchRecords(); // Refresh the records list
                }}
            />

            {/* File Viewer Modal */}
            <FileViewerModal
                isOpen={!!viewingRecord}
                onClose={() => setViewingRecord(null)}
                record={viewingRecord}
            />
        </>
    );
}
