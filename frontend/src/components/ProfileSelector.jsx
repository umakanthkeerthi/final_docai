import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function ProfileSelector({ user, onProfileValues, onLogout }) {
    const [profiles, setProfiles] = useState(user.profiles || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newProfile, setNewProfile] = useState({
        name: '',
        age: '',
        gender: 'Select Gender',
        relation: 'Select Relation',
        blood_group: 'Select Blood Group'
    });

    const handleAddProfile = async (e) => {
        e.preventDefault();
        setAdding(true);

        try {
            const response = await fetch(`${API_BASE}/add_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    ...newProfile
                })
            });
            const data = await response.json();

            if (data.success) {
                setProfiles(data.profiles);
                setShowAddModal(false);
                setNewProfile({
                    name: '',
                    age: '',
                    gender: 'Select Gender',
                    relation: 'Select Relation',
                    blood_group: 'Select Blood Group'
                });
            } else {
                alert(data.detail);
            }
        } catch (err) {
            alert('Failed to add profile');
        } finally {
            setAdding(false);
        }
    };

    const getAvatarColor = (index) => {
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
        return colors[index % colors.length];
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: '#111827', // Netflix-style dark background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100
        }}>
            <h1 style={{ fontSize: 36, fontWeight: 500, marginBottom: 40 }}>Who's checking in?</h1>

            <div style={{
                display: 'flex',
                gap: 32,
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: 1000
            }}>
                {profiles.map((profile, idx) => (
                    <div
                        key={profile.id}
                        onClick={() => onProfileValues(profile)}
                        className="profile-card"
                        style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                    >
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: 12, // Netflix style rounded square
                            background: getAvatarColor(idx),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 40,
                            fontWeight: 700,
                            marginBottom: 16,
                            border: '3px solid transparent'
                        }} className="profile-avatar">
                            {getInitials(profile.name)}
                        </div>
                        <div style={{ fontSize: 16, color: '#9ca3af' }}>{profile.name}</div>
                    </div>
                ))}

                {/* Add Profile Button */}
                <div
                    onClick={() => setShowAddModal(true)}
                    className="profile-card"
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: 12,
                        background: 'transparent',
                        border: '3px solid #374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 60,
                        color: '#6b7280',
                        marginBottom: 16
                    }} className="profile-add">
                        +
                    </div>
                    <div style={{ fontSize: 16, color: '#6b7280' }}>Add Profile</div>
                </div>
            </div>

            <button
                onClick={onLogout}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'transparent',
                    border: '1px solid #374151',
                    color: '#9ca3af',
                    padding: '8px 16px',
                    borderRadius: 4,
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>

            {/* Styles for hover effects */}
            <style>{`
                .profile-card:hover .profile-avatar {
                    border-color: white;
                    transform: scale(1.05);
                }
                .profile-card:hover .profile-add {
                    border-color: white;
                    color: white;
                }
            `}</style>

            {/* Add Profile Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200
                }}>
                    <div className="card" style={{ width: 400, background: 'white', color: 'black' }}>
                        <h2 style={{ marginTop: 0 }}>Add Profile</h2>
                        <form onSubmit={handleAddProfile}>
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    className="active-input"
                                    value={newProfile.name}
                                    onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    className="active-input"
                                    value={newProfile.age}
                                    onChange={e => setNewProfile({ ...newProfile, age: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <select
                                    className="active-input"
                                    value={newProfile.gender}
                                    onChange={e => setNewProfile({ ...newProfile, gender: e.target.value })}
                                >
                                    <option disabled>Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Relation</label>
                                <select
                                    className="active-input"
                                    value={newProfile.relation}
                                    onChange={e => setNewProfile({ ...newProfile, relation: e.target.value })}
                                >
                                    <option disabled>Select Relation</option>
                                    <option>Spouse</option>
                                    <option>Child</option>
                                    <option>Parent</option>
                                    <option>Sibling</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Blood Group</label>
                                <select
                                    className="active-input"
                                    value={newProfile.blood_group}
                                    onChange={e => setNewProfile({ ...newProfile, blood_group: e.target.value })}
                                >
                                    <option disabled>Select Blood Group</option>
                                    <option>A+</option>
                                    <option>A-</option>
                                    <option>B+</option>
                                    <option>B-</option>
                                    <option>O+</option>
                                    <option>O-</option>
                                    <option>AB+</option>
                                    <option>AB-</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="cta-button secondary">Cancel</button>
                                <button type="submit" disabled={adding} className="cta-button">{adding ? 'Adding...' : 'Save Profile'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
