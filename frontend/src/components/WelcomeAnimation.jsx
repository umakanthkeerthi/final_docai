import React, { useEffect, useState } from 'react';

export default function WelcomeAnimation({ onComplete }) {
    const [opacity, setOpacity] = useState(1);
    const [scale, setScale] = useState(0.8);

    useEffect(() => {
        // Fade in scale
        setTimeout(() => setScale(1), 100);

        // Start fade out after 2.5 seconds
        const timer1 = setTimeout(() => {
            setOpacity(0);
        }, 2500);

        // Complete after fade out
        const timer2 = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    if (opacity <= 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: opacity,
            transition: 'opacity 1s ease-in-out'
        }}>
            <div style={{
                textAlign: 'center',
                color: 'white',
                transform: `scale(${scale})`,
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{
                    fontSize: 80,
                    marginBottom: 20,
                    animation: 'pulse 2s infinite'
                }}>
                    🩺
                </div>
                <h1 style={{
                    fontSize: 48,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '0.05em',
                    textShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                    DocAI
                </h1>
                <p style={{
                    fontSize: 18,
                    opacity: 0.9,
                    marginTop: 8,
                    fontWeight: 500
                }}>
                    Your Personal Health Companion
                </p>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
