import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function RxAnalyzer({ onBack }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`${API_BASE}/analyze_prescription`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to analyze prescription');
            }
        } catch (err) {
            setError('Failed to analyze prescription. Please try again.');
            console.error('Analysis error:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <section className="view-section active-view">
            {/* Header */}
            <div className="card" style={{ background: 'var(--primary-teal)', color: 'white', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            color: 'white',
                            fontSize: 20,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ←
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>📋 Prescription Analyzer</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14, opacity: 0.9 }}>
                            Upload a prescription to extract medicines and dosages
                        </p>
                    </div>
                </div>
            </div>

            {!result ? (
                <>
                    {/* Upload Area */}
                    {!preview ? (
                        <div className="card">
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                style={{
                                    border: '2px dashed var(--primary-teal)',
                                    borderRadius: 16,
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    background: 'var(--primary-teal-light)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-dark)' }}>
                                    Drop prescription image here
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--text-soft)', margin: 0 }}>
                                    or click to browse (JPEG, PNG, PDF)
                                </p>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Preview */}
                            <div className="card">
                                <h3 className="card-title">Preview</h3>
                                <img
                                    src={preview}
                                    alt="Prescription preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: 400,
                                        objectFit: 'contain',
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="card" style={{ background: '#fee2e2', border: '2px solid #fca5a5' }}>
                                    <p style={{ color: '#991b1b', margin: 0 }}>⚠️ {error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={handleReset}
                                    className="cta-button secondary"
                                    style={{ flex: 1 }}
                                >
                                    Choose Different Image
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="cta-button"
                                    style={{ flex: 2 }}
                                >
                                    {analyzing ? '🔄 Analyzing...' : '🔍 Analyze Prescription'}
                                </button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* Results */}
                    <div className="card">
                        <h3 className="card-title">Analysis Results</h3>

                        {/* Doctor & Patient Info */}
                        {(result.doctor?.name || result.patient?.name || result.date) && (
                            <div style={{
                                background: 'var(--primary-teal-light)',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 16
                            }}>
                                {result.doctor?.name && (
                                    <div style={{ marginBottom: 8, color: 'var(--text-dark)' }}>
                                        <strong>Doctor:</strong> {result.doctor.name}
                                        {result.doctor.specialization && ` (${result.doctor.specialization})`}
                                    </div>
                                )}
                                {result.patient?.name && (
                                    <div style={{ marginBottom: 8, color: 'var(--text-dark)' }}>
                                        <strong>Patient:</strong> {result.patient.name}
                                        {result.patient.age && `, ${result.patient.age} years`}
                                    </div>
                                )}
                                {result.date && (
                                    <div style={{ color: 'var(--text-dark)' }}>
                                        <strong>Date:</strong> {result.date}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Medicines */}
                        {result.medicines && result.medicines.length > 0 ? (
                            <>
                                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-dark)' }}>
                                    Prescribed Medicines ({result.medicines.length})
                                </h4>
                                {result.medicines.map((med, idx) => (
                                    <div key={idx} className="card" style={{ marginBottom: 12, background: 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <h5 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                                                💊 {med.name}
                                            </h5>
                                            {med.dosage && (
                                                <span style={{
                                                    background: 'var(--primary-teal)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: 12,
                                                    fontSize: 13,
                                                    fontWeight: 600
                                                }}>
                                                    {med.dosage}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }}>
                                            {med.frequency && <div>📅 <strong>Frequency:</strong> {med.frequency}</div>}
                                            {med.duration && <div>⏱️ <strong>Duration:</strong> {med.duration}</div>}
                                            {med.instructions && <div>ℹ️ <strong>Instructions:</strong> {med.instructions}</div>}
                                            {med.route && <div>💉 <strong>Route:</strong> {med.route}</div>}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{
                                background: '#fef3c7',
                                border: '2px solid #fbbf24',
                                borderRadius: 12,
                                padding: 16,
                                color: '#92400e'
                            }}>
                                ⚠️ No medicines found in the prescription
                            </div>
                        )}

                        {/* Diagnosis */}
                        {result.diagnosis && (
                            <div style={{
                                background: 'var(--primary-teal-light)',
                                borderRadius: 12,
                                padding: 12,
                                marginTop: 16,
                                color: 'var(--text-dark)'
                            }}>
                                <strong>Diagnosis:</strong> {result.diagnosis}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={handleReset}
                            className="cta-button secondary"
                            style={{ flex: 1 }}
                        >
                            Analyze Another
                        </button>
                        <button
                            onClick={onBack}
                            className="cta-button"
                            style={{ flex: 1 }}
                        >
                            Done
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
