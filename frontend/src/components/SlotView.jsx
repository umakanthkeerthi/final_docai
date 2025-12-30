import React from 'react';

export default function SlotView({ onBack }) {
    return (
        <section className="view-section active-view">
            <h1 className="card-title" style={{ marginBottom: 8 }}>Available Appointments</h1>
            <div className="location-header">
                Near Current Location (San Francisco, CA)
            </div>
            <div className="slot-card">
                <div className="doc-info-header">
                    <div className="doc-details">
                        <h3 className="doc-name">Dr. Emily Yu</h3>
                        <span className="doc-specialty">Primary Care Physician</span>
                        <span className="doc-distance">0.8 miles away</span>
                    </div>
                </div>
                <div className="slots-container">
                    <div className="slot-row">
                        <span className="slot-day">Today</span>
                        <div className="slot-pills">
                            <div className="slot-pill" onClick={() => alert('Demo: Booking slot for 2:30 PM')}>2:30 PM</div>
                            <div className="slot-pill" onClick={() => alert('Demo: Booking slot for 4:00 PM')}>4:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>
            <button style={{ color: 'var(--text-soft)', background: 'none', border: 'none', padding: 12, width: '100%', cursor: 'pointer', marginTop: 12 }} onClick={onBack}>Back</button>
        </section>
    );
}
