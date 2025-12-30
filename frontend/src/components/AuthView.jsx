import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function AuthView({ onLoginSuccess, onDoctorLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        address: '',
        name: '',
        age: '',
        gender: '',
        blood_group: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const endpoint = isLogin ? '/login' : '/signup';

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                onLoginSuccess(data.user);
            } else {
                setError(data.detail || 'Authentication failed');
            }
        } catch (err) {
            console.error(err);
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            padding: 20,
            boxSizing: 'border-box',
            overflowY: 'auto' // Allow scroll if screen is too short
        }}>
            <div className="auth-card-container">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div className="auth-logo">🩺</div>
                    <h1 style={{ color: '#0f766e', margin: '16px 0 8px', fontSize: 32, fontWeight: 700 }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: 16 }}>
                        {isLogin ? 'Login to access your family health hub' : 'Start your journey to better health'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Common Fields */}
                    <div className="grid-2">
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="active-input"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="active-input"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="signup-section">
                            <div className="section-title">
                                Profile Details
                            </div>

                            <div className="grid-2">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="active-input"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="active-input"
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>

                            <div className="grid-3">
                                <div className="input-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                        className="active-input"
                                        placeholder="25"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="active-input"
                                        required
                                    >
                                        <option value="" disabled>Select</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Blood</label>
                                    <select
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                        className="active-input"
                                        required
                                    >
                                        <option value="" disabled>Group</option>
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
                            </div>

                            <div className="input-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="active-input"
                                    placeholder="City, State"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-btn"
                        >
                            {isLogin ? "New user? Create an account" : "Already have an account? Login"}
                        </button>
                    </div>

                    <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={onDoctorLogin}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Restricted: Doctor Login
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                /* CORE LAYOUT FIXES */
                * {
                    box-sizing: border-box; /* CRITICAL FIX: Ensures padding doesn't increase width */
                }

                .auth-card-container {
                    max-width: ${isLogin ? '500px' : '700px'};
                    width: 100%;
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 20px 50px -12px rgba(0,0,0,0.1);
                    margin: auto;
                    transition: max-width 0.3s ease;
                }

                .auth-logo {
                    font-size: 48px;
                    margin-bottom: 8px;
                    display: inline-block;
                    animation: bounce 2s infinite;
                }

                /* GRID SYSTEMS */
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .grid-3 {
                    display: grid;
                    grid-template-columns: 0.8fr 1.2fr 1fr;
                    gap: 16px;
                }

                /* INPUT LAYOUTS */
                .input-group {
                    margin-bottom: 16px;
                }
                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #475569;
                    margin-left: 2px;
                }
                .active-input {
                    width: 100%; /* Now respects container due to box-sizing */
                    padding: 12px 16px;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #334155;
                    transition: all 0.2s;
                }
                .active-input:focus {
                    border-color: #14b8a6;
                    background: white;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
                }

                /* SECTIONS */
                .signup-section {
                    animation: fadeIn 0.4s ease;
                }
                .section-title {
                    margin: 24px 0 16px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 8px;
                    color: #0d9488;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* BUTTONS */
                .submit-btn {
                    width: 100%;
                    margin-top: 24px;
                    height: 50px;
                    font-size: 16px;
                    background: #0d9488;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .submit-btn:hover {
                    background: #115e59;
                }
                .text-btn {
                    background: transparent;
                    border: none;
                    color: #0d9488;
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 14px;
                    font-weight: 500;
                }

                .error-box {
                    color: #ef4444;
                    background: #fee2e2;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 14px;
                    text-align: center;
                }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

                /* RESPONSIVE */
                @media (max-width: 600px) {
                    .auth-card-container {
                        padding: 24px;
                        margin: 20px 0;
                    }
                    .grid-2, .grid-3 {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                }
            `}</style>
        </div>
    );
}
