import React, { useState, useRef } from 'react';
import { API_BASE } from '../config';

const Spinner = () => (
    <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default function SymptomCheckerView({ onBack, onBookAppointment }) {
    const [symptomInput, setSymptomInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState(null);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Voice Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                setIsAnalyzing(true);
                const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks.current, { type: mimeType });

                const formData = new FormData();
                const extension = mimeType.split('/')[1].split(';')[0];
                formData.append("audio", audioBlob, `recording.${extension}`);

                try {
                    const res = await fetch(`${API_BASE}/process_audio`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!res.ok) {
                        throw new Error("Audio processing failed");
                    }

                    const data = await res.json();
                    if (data.repaired_text) {
                        setSymptomInput(data.repaired_text);
                    }
                } catch (e) {
                    alert("Could not process audio: " + e.message);
                } finally {
                    setIsAnalyzing(false);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (e) {
            alert("Microphone access denied or not supported.");
            console.error(e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleAnalyze = async () => {
        if (!symptomInput.trim()) {
            alert('Please enter your symptoms');
            return;
        }

        setIsAnalyzing(true);

        try {
            const response = await fetch(`${API_BASE}/triage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptom_text: symptomInput })
            });

            const data = await response.json();
            console.log('Triage API Response:', data); // Debug log
            setResult(data);
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze symptoms. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRiskColor = (isEmergency) => {
        return isEmergency ? '#ef4444' : '#10b981';
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
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>🩺 Symptom Checker</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14, opacity: 0.9 }}>
                            Describe your symptoms and get instant assessment
                        </p>
                    </div>
                </div>
            </div>

            {!result ? (
                <>
                    {/* Input Section */}
                    <div className="card">
                        <h3 className="card-title">How are you feeling?</h3>
                        <p className="card-subtitle" style={{ marginBottom: 16 }}>
                            Describe your symptoms in your own words
                        </p>

                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="active-input-area"
                                rows="6"
                                value={symptomInput}
                                onChange={(e) => setSymptomInput(e.target.value)}
                                placeholder="e.g., I have a severe headache, nausea, and sensitivity to light..."
                                disabled={isRecording || isAnalyzing}
                                style={{ paddingBottom: 50 }}
                            ></textarea>

                            {/* Microphone Button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                style={{
                                    position: 'absolute',
                                    bottom: 15,
                                    right: 15,
                                    background: isRecording ? '#e53e3e' : 'var(--primary-teal)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                                title={isRecording ? "Stop Recording" : "Speak"}
                            >
                                {isAnalyzing ? <Spinner /> : <span style={{ fontSize: 20, color: 'white' }}>🎤</span>}
                            </button>

                            {isRecording && (
                                <div style={{ position: 'absolute', bottom: 25, right: 65, color: '#e53e3e', fontSize: 13, fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                                    Listening...
                                </div>
                            )}
                        </div>

                        <button
                            className="cta-button"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !symptomInput.trim()}
                            style={{ marginTop: 16, width: '100%' }}
                        >
                            {isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze Symptoms'}
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="card" style={{ background: 'var(--primary-teal-light)', border: '2px solid var(--primary-teal)' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 24 }}>ℹ️</span>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
                                    How it works
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }}>
                                    <li>AI analyzes your symptoms using medical guidelines</li>
                                    <li>Get instant risk assessment and recommendations</li>
                                    <li>Book appointment if needed</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Results Section */}
                    <div className="card" style={{
                        background: `${getRiskColor(result.is_emergency)}15`,
                        border: `2px solid ${getRiskColor(result.is_emergency)}`
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>
                                {result.is_emergency ? '🚨' : '✅'}
                            </div>
                            <h3 style={{
                                fontSize: 20,
                                fontWeight: 700,
                                margin: 0,
                                color: getRiskColor(result.is_emergency)
                            }}>
                                {result.is_emergency ? 'Urgent Attention Needed' : 'Non-Emergency'}
                            </h3>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16
                        }}>
                            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-dark)' }}>
                                Assessment Summary
                            </h4>
                            <p style={{ fontSize: 14, color: 'var(--text-soft)', margin: 0, lineHeight: 1.6 }}>
                                {result.reason || result.action || 'Your symptoms have been analyzed. Please see the recommendations below.'}
                            </p>
                        </div>

                        {result.matched_condition && (
                            <div style={{
                                background: 'white',
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 16
                            }}>
                                <strong style={{ color: 'var(--text-dark)' }}>Matched Condition:</strong>{' '}
                                <span style={{ color: 'var(--text-soft)' }}>{result.matched_condition}</span>
                            </div>
                        )}
                    </div>

                    {/* Correlation Analysis */}
                    {result.correlation_analysis && result.correlation_analysis.cluster_matches && result.correlation_analysis.cluster_matches.length > 0 && (
                        <div className="card" style={{ background: 'var(--primary-teal-light)', border: '2px solid var(--primary-teal)' }}>
                            <h3 className="card-title" style={{ color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>🔗</span> Symptom Pattern Analysis
                            </h3>

                            <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 16 }}>
                                {result.correlation_analysis.analysis_summary}
                            </p>

                            {result.correlation_analysis.cluster_matches.map((match, idx) => (
                                <div key={idx} className="card" style={{ marginBottom: 8, background: 'white' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <strong style={{ fontSize: 15, color: 'var(--text-dark)' }}>{match.condition}</strong>
                                        <span style={{
                                            background: match.confidence === 'high' ? '#10b981' : match.confidence === 'medium' ? '#f59e0b' : '#6b7280',
                                            color: 'white',
                                            padding: '3px 10px',
                                            borderRadius: 12,
                                            fontSize: 11,
                                            fontWeight: 600
                                        }}>
                                            {match.match_percentage}% match
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
                                        {match.core_matches} core symptoms • {match.related_matches} related symptoms
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                        <button
                            className="cta-button"
                            onClick={onBookAppointment}
                            style={{
                                background: result.is_emergency ? '#ef4444' : 'var(--primary-teal)',
                                fontSize: 16
                            }}
                        >
                            📅 Book Appointment
                        </button>
                        <button
                            className="cta-button secondary"
                            onClick={() => setResult(null)}
                        >
                            Check Another Symptom
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
