import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config';

export default function ChatView({ initialMessage, onEndSession, patientName, onEmergency }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const chatEndRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // --- MOUNT LOGIC ---
    useEffect(() => {
        if (initialMessage && messages.length === 0) {
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
                    patientId: 'guest',
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
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: 'calc(100vh - 140px)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--primary-teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>AI</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. AI (Virtual)</div>
                        <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Online • NHSRC Guidelines</div>
                    </div>
                    {/* END BUTTON */}
                    <button
                        onClick={onEndSession}
                        style={{ marginLeft: 'auto', border: '1px solid #fed7d7', background: '#fff5f5', color: '#c53030', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                    >
                        End & Summarize
                    </button>
                </div>

                {/* --- MESSAGES AREA --- */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{
                            alignSelf: m.sender === 'patient' ? 'flex-end' : (m.sender === 'system' ? 'center' : 'flex-start'),
                            maxWidth: m.sender === 'system' ? '90%' : '80%',
                            background: m.sender === 'patient' ? 'var(--primary-teal)' : (m.sender === 'system' ? '#e2e8f0' : 'white'),
                            color: m.sender === 'patient' ? 'white' : (m.sender === 'system' ? '#718096' : 'var(--text-dark)'),
                            padding: m.sender === 'system' ? '8px 12px' : '12px 16px',
                            borderRadius: 16,
                            borderBottomRightRadius: m.sender === 'patient' ? 4 : 16,
                            borderTopLeftRadius: m.sender === 'ai' ? 4 : 16,
                            fontSize: m.sender === 'system' ? 12 : 14,
                        }}>
                            {m.message}
                        </div>
                    ))}
                    {isSending && <div style={{ alignSelf: 'flex-start', color: '#a0aec0', fontSize: 13, marginLeft: 10 }}>Thinking...</div>}
                    <div ref={chatEndRef}></div>
                </div>

                {/* --- INPUT AREA --- */}
                <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #edf2f7', display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* MIC BUTTON */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        title={isRecording ? "Stop Recording" : "Start Voice Input"}
                        style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: isRecording ? '#e53e3e' : '#edf2f7',
                            border: 'none', cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {isRecording ? (
                            <div style={{ width: 12, height: 12, background: 'white', borderRadius: 2 }}></div>
                        ) : (
                            <span style={{ fontSize: 20 }}>🎤</span>
                        )}
                    </button>

                    <input
                        style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none' }}
                        placeholder={isRecording ? "Listening..." : "Type here..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isSending && !isRecording} // Disable input while sending, but enable while recording
                    />

                    <button
                        onClick={handleSend}
                        disabled={isSending || !input.trim()}
                        style={{ background: 'var(--primary-teal)', color: 'white', border: 'none', padding: '0 20px', borderRadius: 8, height: 44, opacity: (!input.trim() || isSending) ? 0.6 : 1 }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </section>
    );
}
