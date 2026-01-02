import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

export default function ProfileSelector({ profiles, onSelect, onLogout }) {
    const { addProfile } = useAuth();
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
            const result = await addProfile(newProfile);

            if (result.success) {
                setShowAddModal(false);
                setNewProfile({
                    name: '',
                    age: '',
                    gender: 'Select Gender',
                    relation: 'Select Relation',
                    blood_group: 'Select Blood Group'
                });
            } else {
                alert(result.error || 'Failed to add profile');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add profile');
        } finally {
            setAdding(false);
        }
    };

    const getAvatarColor = (index) => {
        const colors = ['#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#134e4a'];
        return colors[index % colors.length];
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f766e',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'auto',
            padding: '40px 20px',
            boxSizing: 'border-box'
        }}>
            {/* Language Selector Top Left */}
            <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 110 }}>
                <LanguageSelector />
            </div>

            <h1 style={{
                fontSize: 36,
                fontWeight: 700,
                marginBottom: 40,
                color: '#0f766e',
                textAlign: 'center',
                width: '100%'
            }}>Who's checking in?</h1>

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
                        onClick={() => onSelect(profile)}
                        className="profile-card"
                        style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                    >
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: 12,
                            background: getAvatarColor(idx),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 40,
                            fontWeight: 700,
                            marginBottom: 16,
                            border: '3px solid transparent',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }} className="profile-avatar">
                            {getInitials(profile.name)}
                        </div>
                        <div style={{ fontSize: 16, color: '#0f766e', fontWeight: 600 }}>{profile.name}</div>
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
                        background: 'white',
                        border: '3px dashed #14b8a6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 60,
                        color: '#14b8a6',
                        marginBottom: 16,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }} className="profile-add">
                        +
                    </div>
                    <div style={{ fontSize: 16, color: '#14b8a6', fontWeight: 600 }}>Add Profile</div>
                </div>
            </div>

            <button
                onClick={onLogout}
                style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    background: 'white',
                    border: '2px solid #14b8a6',
                    color: '#14b8a6',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#14b8a6';
                    e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#14b8a6';
                }}
            >
                Logout
            </button>

            {/* Styles for hover effects */}
            <style>{`
                .profile-card:hover .profile-avatar {
                    border-color: #14b8a6;
                    transform: scale(1.05);
                }
                .profile-card:hover .profile-add {
                    border-color: #0f766e;
                    color: #0f766e;
                    background: #f0fdfa;
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
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowAddModal(false)}>
                    <div style={{
                        width: 450,
                        background: 'white',
                        borderRadius: 16,
                        padding: 32,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{
                            marginTop: 0,
                            marginBottom: 24,
                            color: '#0f766e',
                            fontSize: 24,
                            fontWeight: 700
                        }}>Add Profile</h2>
                        <form onSubmit={handleAddProfile}>
                            {/* Name */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Name</label>
                                <input
                                    value={newProfile.name}
                                    onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                                    required
                                    placeholder="Enter full name"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Age */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Age</label>
                                <input
                                    type="number"
                                    value={newProfile.age}
                                    onChange={e => setNewProfile({ ...newProfile, age: e.target.value })}
                                    required
                                    placeholder="Enter age"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Gender - Grid Layout */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Gender</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                    {['Male', 'Female', 'Other'].map(gender => (
                                        <button
                                            key={gender}
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, gender })}
                                            style={{
                                                padding: '12px',
                                                background: newProfile.gender === gender ? '#14b8a6' : 'white',
                                                color: newProfile.gender === gender ? 'white' : '#6b7280',
                                                border: `2px solid ${newProfile.gender === gender ? '#14b8a6' : '#e5e7eb'}`,
                                                borderRadius: 8,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {gender}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Relation - Grid Layout */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Relation</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                    {['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map(relation => (
                                        <button
                                            key={relation}
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, relation })}
                                            style={{
                                                padding: '12px',
                                                background: newProfile.relation === relation ? '#14b8a6' : 'white',
                                                color: newProfile.relation === relation ? 'white' : '#6b7280',
                                                border: `2px solid ${newProfile.relation === relation ? '#14b8a6' : '#e5e7eb'}`,
                                                borderRadius: 8,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {relation}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Blood Group - Grid Layout */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Blood Group</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(blood => (
                                        <button
                                            key={blood}
                                            type="button"
                                            onClick={() => setNewProfile({ ...newProfile, blood_group: blood })}
                                            style={{
                                                padding: '12px',
                                                background: newProfile.blood_group === blood ? '#14b8a6' : 'white',
                                                color: newProfile.blood_group === blood ? 'white' : '#6b7280',
                                                border: `2px solid ${newProfile.blood_group === blood ? '#14b8a6' : '#e5e7eb'}`,
                                                borderRadius: 8,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {blood}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: 'white',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#9ca3af';
                                        e.target.style.background = '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.background = 'white';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: adding ? '#9ca3af' : '#14b8a6',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        cursor: adding ? 'not-allowed' : 'pointer',
                                        color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!adding) e.target.style.background = '#0f766e';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!adding) e.target.style.background = '#14b8a6';
                                    }}
                                >
                                    {adding ? 'Adding...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
