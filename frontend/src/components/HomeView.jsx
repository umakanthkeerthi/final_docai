import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';
import LanguageSelector from './LanguageSelector';

const Spinner = () => (
    <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite', verticalAlign: 'middle', marginRight: 8 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default function HomeView({ onAnalyze, onViewChange, userName, isAnalyzing }) {
    const { t } = useTranslation();
    const [symptomInput, setSymptomInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);

    // Audio Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const textareaRef = useRef(null);

    // --- AUDIO LOGIC ---
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
                setIsProcessingAudio(true);
                const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks.current, { type: mimeType });

                const formData = new FormData();
                formData.append("audio", audioBlob, "recording" + (mimeType.includes("webm") ? ".webm" : ".wav"));

                try {
                    const response = await fetch(`${API_BASE}/process_audio`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) throw new Error("Audio processing failed");

                    const data = await response.json();
                    setSymptomInput(data.repaired_text || data.text);
                } catch (err) {
                    console.error("Audio Upload Error:", err);
                    alert("Could not process audio. Please try typing.");
                } finally {
                    setIsProcessingAudio(false);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone Error:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const handleAnalyzeClick = () => {
        onAnalyze(symptomInput);
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Hero Section */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h1 style={{
                        fontSize: 32,
                        marginBottom: 8,
                        color: 'var(--text-dark)',
                        fontWeight: 800,
                        marginTop: 0
                    }}>
                        {t('home.greeting', { name: userName || 'User' })}
                    </h1>
                    <LanguageSelector variant="minimal" />
                </div>
                <p style={{ color: 'var(--text-soft)', fontSize: 16, marginTop: 0 }}>
                    {t('home.subtitle')}
                </p>
            </div>

            {/* Quick Input Card */}
            <div className="card" style={{ padding: 20, marginBottom: 24, position: 'relative' }}>
                <textarea
                    ref={textareaRef}
                    className="symptom-input"
                    placeholder={t('home.symptomPlaceholder')}
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '12px 50px 12px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 12,
                        fontSize: 15,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Voice Button - Positioned absolutely in bottom right */}
                <button
                    className={`voice-btn ${isRecording ? 'recording' : ''} ${isProcessingAudio ? 'processing' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessingAudio}
                    title={isRecording ? t('home.stopRecording') : t('home.useVoice')}
                    style={{
                        position: 'absolute',
                        bottom: 28,
                        right: 28,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: 'none',
                        background: isRecording ? '#ef4444' : (isProcessingAudio ? '#94a3b8' : 'var(--primary-teal)'),
                        color: 'white',
                        cursor: isProcessingAudio ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s',
                        opacity: isProcessingAudio ? 0.7 : 1
                    }}
                >
                    {isProcessingAudio ? (
                        <div className="spinner" style={{
                            width: 20,
                            height: 20,
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }}></div>
                    ) : isRecording ? (
                        <div style={{
                            width: 12,
                            height: 12,
                            background: 'white',
                            borderRadius: 2
                        }}></div>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Analyze Button */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <button
                    className="cta-button"
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing || !symptomInput.trim()}
                    style={{
                        padding: '14px 40px',
                        fontSize: 18,
                        borderRadius: 30,
                        boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isAnalyzing ? (
                        <>
                            <Spinner /> {t('home.analyzing')}
                        </>
                    ) : t('home.analyzeSymptoms')}
                </button>
            </div>

            {/* FEATURES GRID */}
            <h3 style={{ marginBottom: 16, color: 'var(--text-dark)' }}>{t('home.whatToDo')}</h3>
            <div className="grid-2">
                {/* 1. Prescription Upload (OCR) */}
                <div className="card action-card" onClick={() => onViewChange('rx-upload')}>
                    <div className="icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
                        📄
                    </div>
                    <h3>{t('home.uploadRx')}</h3>
                    <p>{t('home.uploadRxDesc')}</p>
                </div>

                {/* 2. Detailed Symptom Checker */}
                <div className="card action-card" onClick={() => onViewChange('symptom-checker')}>
                    <div className="icon-box" style={{ background: '#e0f2fe', color: '#0da5e9' }}>
                        🩺
                    </div>
                    <h3>{t('home.symptomChecker')}</h3>
                    <p>{t('home.symptomCheckerDesc')}</p>
                </div>
            </div>

            <style>{`
                .symptom-input {
                    width: 100%;
                    border: none;
                    background: transparent;
                    font-size: 18px;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    color: var(--text-dark);
                }
                
                .voice-btn {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: var(--primary-teal);
                    color: white;
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .voice-btn:hover {
                    transform: scale(1.1);
                }
                
                .voice-btn.recording {
                    width: auto;
                    padding: 0 16px;
                    border-radius: 22px;
                    background: #ef4444;
                }
                
                .wave-animation {
                    animation: pulse 1.5s infinite;
                    font-weight: 600;
                    font-size: 14px;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .action-card {
                    padding: 20px 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                    text-align: center;
                    border: 1px solid transparent;
                }
                
                .action-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                    border-color: #f1f5f9;
                }
                
                .action-card:active {
                    transform: scale(0.98);
                }
                
                .icon-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin: 0 auto 12px;
                }
                
                .action-card h3 {
                    margin: 0 0 4px;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-dark);
                }
                
                .action-card p {
                    margin: 0;
                    font-size: 13px;
                    color: var(--text-soft);
                }
                
                @media (max-width: 480px) {
                    .grid-2 {
                        gap: 12px;
                    }
                    .action-card {
                        padding: 16px 12px;
                    }
                }
            `}</style>
        </div>
    );
}
