import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Square, Check, Loader2, FileText } from 'lucide-react';

const API_BASE = "http://localhost:8002";

const PatientAssistant = ({ onConsultationComplete, initialMessage }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: "Namaste! Speak in your language. I will listen to your symptoms and provide NHSRC medical guidelines." }
    ]);

    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [pendingData, setPendingData] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [selectedLang, setSelectedLang] = useState('Auto');
    const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const chatEndRef = useRef(null);
    const sessionIdRef = useRef(
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (initialMessage && !hasInitialized.current) {
            hasInitialized.current = true;
            setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: initialMessage }]);

            const processInitialMessage = async () => {
                setIsProcessing(true);
                try {
                    const transResponse = await fetch(`${API_BASE}/api/translate_text`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: initialMessage, session_id: sessionIdRef.current })
                    });
                    const transData = await transResponse.json();
                    await runChatCycle(transData.english_text, transData.detected_language);
                } catch (e) {
                    console.error("Initial message translation failed:", e);
                    setIsProcessing(false);
                }
            };

            processInitialMessage();
        }
    }, [initialMessage]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, pendingData, isProcessing]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = handleAudioStop;
            mediaRecorder.start();
            setIsListening(true);
        } catch (err) {
            alert("Microphone access denied. Please enable permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleAudioStop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");
        formData.append("language_hint", selectedLang);

        try {
            const response = await fetch(`${API_BASE}/api/process_audio`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Audio processing error:", errorText);
                throw new Error("Audio processing failed");
            }

            const data = await response.json();

            // Validate response data
            if (!data.repaired_text || !data.english_text || !data.detected_language) {
                console.error("Invalid response data:", data);
                throw new Error("Invalid response from server");
            }

            setPendingData({
                repaired: data.repaired_text,
                english: data.english_text,
                language: data.detected_language
            });
        } catch (error) {
            console.error("Audio processing error:", error);
            alert("Could not process audio. Please try typing.");
            setAudioUrl(null); // Clear the audio URL
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!pendingData) return;
        const userMessage = pendingData.repaired;
        const translationContext = pendingData.english;

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
        setPendingData(null);
        setAudioUrl(null);

        await runChatCycle(translationContext, pendingData.language);
    };

    const handleManualSend = async () => {
        if (!inputText.trim()) return;
        const userQuery = inputText;
        setInputText('');
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userQuery }]);

        setIsProcessing(true);
        try {
            const transResponse = await fetch(`${API_BASE}/api/translate_text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userQuery, session_id: sessionIdRef.current })
            });
            const transData = await transResponse.json();

            await runChatCycle(transData.english_text, transData.detected_language);
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
        }
    };

    const runChatCycle = async (englishMessage, language) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_BASE}/api/chat_with_guidelines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: englishMessage,
                    session_id: sessionIdRef.current,
                    target_language: language || "English",
                    history: messages.map(m => ({
                        role: m.sender === 'user' ? 'user' : 'assistant',
                        content: m.text
                    }))
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Chat API error:", errorText);
                throw new Error("Failed to get response from AI");
            }

            const data = await response.json();

            // Validate response
            if (!data.reply || !data.reply.answer) {
                console.error("Invalid chat response:", data);
                throw new Error("Invalid response from server");
            }

            const reply = data.reply;

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: reply.answer,
                sources: reply.sources || [],
                isFinal: reply.is_final
            }]);

            if (reply.structured_record) {
                setIsEmergencyLocked(true);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSummary = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_BASE}/api/generate_summary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    target_language: selectedLang || "English"
                })
            });

            const data = await response.json();

            if (onConsultationComplete) {
                onConsultationComplete(data);
            } else {
                console.log("No handoff handler", data);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'bot',
                    text: data.display_text,
                    isSummary: true
                }]);
            }

        } catch (error) {
            alert("Failed to generate summary.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 60px)',
            background: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Header Bar with Language Selector and Actions */}
            <div style={{
                padding: '12px 16px',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <select
                    value={selectedLang}
                    onChange={e => setSelectedLang(e.target.value)}
                    style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="Auto">🌐 Auto Detect</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Telugu">🇮🇳 Telugu</option>
                    <option value="Tamil">🇮🇳 Tamil</option>
                    <option value="English">🇺🇸 English</option>
                </select>

                {messages.length > 2 && !isEmergencyLocked && (
                    <button
                        onClick={handleSummary}
                        style={{
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '1px solid #c7d2fe',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FileText size={16} /> End & Summarize
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            maxWidth: '85%',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            background: msg.sender === 'user' ? 'var(--primary-teal)' :
                                msg.isSummary ? '#e0e7ff' : 'white',
                            color: msg.sender === 'user' ? 'white' : '#1e293b',
                            border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                            borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px'
                        }}>
                            {msg.isSummary && <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '8px' }}>Case Summary</div>}
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{msg.text}</p>

                            {msg.sources && msg.sources.length > 0 && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {msg.sources.map((src, i) => (
                                        <span key={i} style={{ fontSize: '11px', padding: '4px 8px', background: '#ccfbf1', color: '#0f766e', borderRadius: '4px', border: '1px solid #99f6e4' }} title={src.content}>
                                            📄 Page {src.page} ({src.topic || 'Ref'})
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isProcessing && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', marginLeft: '16px' }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI is thinking...</div>}
                <div ref={chatEndRef} />
            </main>

            {/* Input Area */}
            <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                {/* Pending Confirmation Box */}
                {pendingData && (
                    <div style={{ marginBottom: '16px', background: '#fef3c7', border: '1px solid #fde047', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>Verify Detected Text:</h4>
                            <textarea
                                style={{ width: '100%', padding: '8px', border: '1px solid #fde047', borderRadius: '8px', fontSize: '16px', background: 'white', fontFamily: 'inherit' }}
                                value={pendingData.repaired}
                                onChange={e => setPendingData({ ...pendingData, repaired: e.target.value })}
                                rows={3}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button onClick={() => setPendingData(null)} style={{ padding: '6px 12px', fontSize: '14px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleConfirm} style={{ padding: '8px 16px', background: 'var(--primary-teal)', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
                                    <Check size={16} /> Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Controls */}
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={isListening ? stopRecording : startRecording}
                        style={{
                            padding: '16px',
                            borderRadius: '50%',
                            background: isListening ? '#ef4444' : '#f1f5f9',
                            color: isListening ? 'white' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            animation: isListening ? 'pulse 2s infinite' : 'none'
                        }}
                    >
                        {isListening ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
                    </button>

                    <input
                        type="text"
                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '12px 20px', outline: 'none', fontSize: '16px', fontFamily: 'inherit' }}
                        placeholder={isListening ? "Listening..." : "Type or speak symptoms..."}
                        value={inputText}
                        disabled={isListening}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleManualSend()}
                    />

                    <button
                        onClick={handleManualSend}
                        disabled={!inputText.trim()}
                        style={{
                            padding: '12px',
                            background: 'var(--primary-teal)',
                            color: 'white',
                            borderRadius: '50%',
                            border: 'none',
                            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                            opacity: inputText.trim() ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
};

export default PatientAssistant;
