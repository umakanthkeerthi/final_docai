import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config';

export default function SummaryView({ onHome, onBook }) {
    const [summary, setSummary] = useState("Generating medical summary...");

    useEffect(() => {
        // Fetch summary on mount
        fetch(`${API_BASE}/generate_summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: 'guest' }) // In real app, pass actual ID
        })
            .then(res => res.json())
            .then(data => setSummary(data.summary))
            .catch(e => setSummary("Error generating summary."));
    }, []);

    return (
        <section className="view-section active-view">
            <h1 className="card-title">Consultation Summary</h1>
            <div className="card" style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.6 }}>
                {summary}
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
