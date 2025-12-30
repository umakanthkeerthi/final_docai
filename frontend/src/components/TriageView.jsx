import React from 'react';

export default function TriageView({ result, onStartOver, onProceedToChat, onBookSlot }) {
    const isEmergency = result?.is_emergency;

    return (
        <section className="view-section active-view">
            <div className={`triage-banner ${isEmergency ? 'banner-alert' : 'banner-success'}`}>
                <h3>{isEmergency ? "Urgent Attention Recommended" : "Self-Care / Non-Urgent"}</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{result?.action || "Please consult a doctor."}</p>
            </div>

            <div className="card">
                <h2 className="card-title">Analysis Summary</h2>
                <p className="reasoning-text">
                    {result?.reason || "Analysis complete."}
                </p>
                {result?.matched_condition && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#718096' }}>
                        Flagged Condition: {result.matched_condition}
                    </div>
                )}
            </div>

            {/* Correlation Analysis Section */}
            {result?.correlation_analysis && (
                <div className="card" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', border: '2px solid #667eea' }}>
                    <h2 className="card-title" style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🔗</span> Symptom Pattern Analysis
                    </h2>

                    {/* Summary */}
                    <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 16 }}>
                        {result.correlation_analysis.analysis_summary}
                    </p>

                    {/* Cluster Matches */}
                    {result.correlation_analysis.cluster_matches && result.correlation_analysis.cluster_matches.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Possible Conditions:</h3>
                            {result.correlation_analysis.cluster_matches.map((match, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    borderRadius: 10,
                                    padding: 12,
                                    marginBottom: 8,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <strong style={{ fontSize: 15 }}>{match.condition}</strong>
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
                                    <div style={{ fontSize: 13, color: '#718096' }}>
                                        {match.core_matches} core symptoms • {match.related_matches} related symptoms
                                    </div>
                                    <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>
                                        Severity: {match.severity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Related Symptoms */}
                    {result.correlation_analysis.related_symptoms && result.correlation_analysis.related_symptoms.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                                People with similar symptoms also reported:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {result.correlation_analysis.related_symptoms.map((symptom, idx) => (
                                    <span key={idx} style={{
                                        background: '#f0f9ff',
                                        color: '#1e40af',
                                        padding: '4px 10px',
                                        borderRadius: 12,
                                        fontSize: 12,
                                        border: '1px solid #bfdbfe'
                                    }}>
                                        {symptom}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Correlation Strength Indicator */}
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Correlation Strength:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: result.correlation_analysis.correlation_strength === 'strong' ? '#10b981' :
                                        result.correlation_analysis.correlation_strength === 'moderate' ? '#f59e0b' : '#6b7280',
                                    width: result.correlation_analysis.correlation_strength === 'strong' ? '100%' :
                                        result.correlation_analysis.correlation_strength === 'moderate' ? '66%' : '33%',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                                {result.correlation_analysis.correlation_strength}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ backgroundColor: isEmergency ? '#fff5f5' : 'var(--primary-teal-light)', border: `1px solid ${isEmergency ? '#fc8181' : 'var(--primary-teal)'}` }}>
                <h2 className="card-title" style={{ color: isEmergency ? '#c53030' : 'var(--primary-teal)' }}>
                    {isEmergency ? "Emergency Action Plan" : "Recommended Next Steps"}
                </h2>

                {isEmergency ? (
                    <>
                        <p><strong>Your symptoms need doctor's attention.</strong></p>
                        <p style={{ marginTop: 4 }}>Your symptoms indicate a potentially serious condition matching our protocols.</p>

                        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                            <button className="cta-button" style={{ backgroundColor: '#c53030' }}>Call Emergency Services (911)</button>
                            <button className="cta-button" onClick={onBookSlot} style={{ backgroundColor: 'white', color: '#c53030', border: '1px solid #c53030' }}>
                                Book Urgent Appointment
                            </button>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 13 }}>Or go to the nearest ER immediately.</div>
                    </>
                ) : (
                    <>
                        <p>Book a sameday video visit with a primary care provider or chat with our automated guideliness assistant.</p>
                        <button className="cta-button" onClick={onBookSlot}>Find Available Appointments</button>

                        <div style={{ marginTop: 16, borderTop: '1px solid var(--primary-teal)', paddingTop: 16 }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>Need to clarify your symptoms?</p>
                            <button
                                className="cta-button secondary"
                                style={{ background: 'white', borderColor: 'var(--primary-teal)' }}
                                onClick={onProceedToChat}
                            >
                                Chat with Dr. AI (Virtual)
                            </button>
                        </div>
                    </>
                )}
            </div>

            <button style={{ color: 'var(--text-soft)', background: 'none', border: 'none', padding: 12, width: '100%', cursor: 'pointer', marginTop: 12 }} onClick={onStartOver}>
                Start Over
            </button>
        </section>
    );
}
