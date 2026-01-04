import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config';

export default function ChatView({ initialMessage, onEndSession, patientName, patientId, onEmergency }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const chatEndRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // --- MOUNT LOGIC ---
    // Use ref to prevent double-fire in Strict Mode
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (initialMessage && messages.length === 0 && !isFetchingRef.current) {
            isFetchingRef.current = true;

            // Add initial user message
            const userMsg = { id: 1, sender: 'patient', message: initialMessage, timestamp: Date.now() };
            // Add placeholder system message
            const sysMsg = { id: 1.5, sender: 'system', message: 'Connecting to Dr. AI...', timestamp: Date.now() };

            setMessages([userMsg, sysMsg]);

            // Trigger AI Fetch
            fetchAIResponse(initialMessage, []);
        }
    }, [initialMessage]); // Dependency on initialMessage

    // --- SCROLL LOGIC ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    // --- API LOGIC ---
    const fetchAIResponse = async (text, currentHistory) => {
        setIsSending(true);
        try {
            const res = await fetch(`${API_BASE}/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: patientId || ('guest_' + Date.now()),
                    doctorId: 'ai_doc',
                    patientName: patientName || 'Guest',
                    doctorName: 'AI',
                    message: text,
                    sender: 'patient'
                })
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();

            setMessages(prev => {
                // Remove loading message
                const filtered = prev.filter(m => m.sender !== 'system');
                return [...filtered, {
                    id: Date.now(),
                    sender: 'ai',
                    message: data.reply,
                    timestamp: Date.now()
                }];
            });

            // CHECK FOR EMERGENCY REDIRECT
            if (data.reply.includes("EMERGENCY DETECTED")) {
                setTimeout(() => {
                    if (onEmergency) onEmergency();
                }, 1500); // Wait 1.5s so user sees the message first
            }

        } catch (e) {
            console.error("ChatView: API Failed", e);
            setMessages(prev => {
                const filtered = prev.filter(m => m.sender !== 'system');
                return [...filtered, {
                    id: Date.now(),
                    sender: 'ai',
                    message: "I apologize, I am having trouble connecting. Please try again.",
                    timestamp: Date.now()
                }];
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleSend = () => {
        if (!input.trim() || isSending) return;
        const text = input;
        setInput('');

        // Optimistic Update
        const newMsg = { id: Date.now(), sender: 'patient', message: text, timestamp: Date.now() };
        setMessages(prev => [...prev, newMsg]);

        fetchAIResponse(text, messages);
    };

    // --- AUDIO LOGIC ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = e => {
                if (e.data.size > 0) audioChunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = async () => {
                // Determine mimeType
                const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks.current, { type: mimeType });

                // Form Data
                const formData = new FormData();
                const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
                formData.append("audio", audioBlob, `input.${ext}`);

                setIsSending(true); // Show sending state
                try {
                    const res = await fetch(`${API_BASE}/api/process_audio`, { method: 'POST', body: formData });
                    if (!res.ok) throw new Error("Audio Backend Error");
                    const data = await res.json();

                    if (data.text) {
                        setInput(prev => (prev ? prev + " " : "") + data.text);
                    }
                } catch (e) {
                    alert("Could not transcribe audio.");
                    console.error(e);
                } finally {
                    setIsSending(false);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (e) {
            console.error("Mic Error", e);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <section className="view-section active-view" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* --- HEADER --- */}
            <div className="card full-height-card" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                borderRadius: 0, // Flatten borders for full screen feel
                border: 'none',  // Remove border for cleaner native look
                height: '100%'   // Ensure it fills container
            }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #edf2f7', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--primary-teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13 }}>AI</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Dr. AI (Virtual)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Online • NHSRC Guidelines</div>
                    </div>
                    {/* END BUTTON */}
                    <button
                        onClick={onEndSession}
                        style={{ marginLeft: 'auto', border: '1px solid #fed7d7', background: '#fff5f5', color: '#c53030', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                        End
                    </button>
                </div>

                {/* --- MESSAGES AREA --- */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{
                            alignSelf: m.sender === 'patient' ? 'flex-end' : (m.sender === 'system' ? 'center' : 'flex-start'),
                            maxWidth: m.sender === 'system' ? '90%' : '85%',
                            background: m.sender === 'patient' ? 'var(--primary-teal)' : (m.sender === 'system' ? '#e2e8f0' : 'white'),
                            color: m.sender === 'patient' ? 'white' : (m.sender === 'system' ? '#718096' : 'var(--text-dark)'),
                            padding: m.sender === 'system' ? '8px 12px' : '10px 14px',
                            borderRadius: 12,
                            borderBottomRightRadius: m.sender === 'patient' ? 2 : 12,
                            borderTopLeftRadius: m.sender === 'ai' ? 2 : 12,
                            fontSize: m.sender === 'system' ? 12 : 15,
                            lineHeight: 1.4,
                            boxShadow: m.sender !== 'system' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                        }}>
                            {m.message}
                        </div>
                    ))}
                    {isSending && <div style={{ alignSelf: 'flex-start', color: '#a0aec0', fontSize: 13, marginLeft: 10 }}>Typing...</div>}
                    <div ref={chatEndRef}></div>
                </div>

                {/* --- INPUT AREA --- */}
                <div style={{ padding: '10px 12px', background: 'white', borderTop: '1px solid #edf2f7', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* MIC BUTTON */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className="mobile-icon-btn"
                        title={isRecording ? "Stop Recording" : "Start Voice Input"}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: isRecording ? '#e53e3e' : '#f1f5f9',
                            color: isRecording ? 'white' : '#64748b',
                            border: 'none', cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isRecording ? (
                            <div style={{ width: 10, height: 10, background: 'white', borderRadius: 2 }}></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        )}
                    </button>

                    <input
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 20,
                            border: '1px solid #e2e8f0',
                            fontSize: 15,
                            outline: 'none',
                            background: '#f8fafc',
                            minWidth: 0 // Crucial for flex containers
                        }}
                        placeholder={isRecording ? "Listening..." : "Type here..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isSending && !isRecording}
                    />

                    <button
                        onClick={handleSend}
                        disabled={isSending || !input.trim()}
                        style={{
                            background: 'var(--primary-teal)',
                            color: 'white',
                            border: 'none',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: (!input.trim() || isSending) ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: -2 }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
