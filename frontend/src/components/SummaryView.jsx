import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config';

export default function SummaryView({ onHome, onBook, initialSummary }) {
    const [summary, setSummary] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (initialSummary) {
            // Use provided summary data (format it nicely)
            let formattedSummary = "";

            // If it's the structured record from PatientAssistant
            if (initialSummary.clinical_summary) {
                formattedSummary += `**Presenting Symptoms:** ${initialSummary.clinical_summary.presenting_symptoms.join(', ')}\n`;
                formattedSummary += `**Duration:** ${initialSummary.clinical_summary.duration}\n\n`;
                formattedSummary += `**History:** ${initialSummary.clinical_summary.history_of_illness}\n\n`;

                if (initialSummary.display_text) {
                    formattedSummary = initialSummary.display_text;
                }
            } else {
                formattedSummary = JSON.stringify(initialSummary, null, 2);
            }

            setSummary(formattedSummary);
            setIsLoading(false);
            return;
        }

        // Fallback: Fetch summary if not provided
        fetch(`${API_BASE}/generate_summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: 'guest' }) // In real app, pass actual ID
        })
            .then(res => res.json())
            .then(data => {
                setSummary(data.summary);
                setIsLoading(false);
            })
            .catch(e => {
                setSummary("Error generating summary.");
                setIsLoading(false);
            });
    }, []);

    return (
        <section className="view-section active-view">
            <h1 className="card-title">Consultation Summary</h1>
            <div className="card" style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.6, minHeight: 120 }}>
                {isLoading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 16,
                        padding: '40px 20px'
                    }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            border: '4px solid #e2e8f0',
                            borderTop: '4px solid var(--primary-teal)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: 'var(--text-soft)', margin: 0 }}>
                            Generating medical summary...
                        </p>
                    </div>
                ) : (
                    summary
                )}
            </div>

            <div className="card" style={{ border: '1px solid var(--primary-teal)', background: 'var(--primary-teal-light)' }}>
                <h3>Next Steps</h3>
                <p>Based on this consultation, we recommend seeing a specialist.</p>
                <button className="cta-button" onClick={onBook}>Book Appointment Now</button>
            </div>

            <button style={{ color: 'var(--text-soft)', background: 'none', border: 'none', padding: 12, width: '100%', cursor: 'pointer', marginTop: 12 }} onClick={onHome}>
                Return to Home
            </button>
        </section>
    );
}
