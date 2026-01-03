import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './DoctorLogin.css';

export default function DoctorLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get doctor profile from Firestore
            const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));

            if (doctorDoc.exists()) {
                const doctorData = doctorDoc.data();

                // Verify it's a doctor account
                if (doctorData.role === 'doctor') {
                    console.log('✅ Doctor logged in:', doctorData.name);
                    // Pass doctor data to parent, explicitly including UID
                    onLoginSuccess({ ...doctorData, uid: user.uid });
                } else {
                    setError('This account is not registered as a doctor.');
                    await auth.signOut();
                }
            } else {
                setError('Doctor profile not found. Please contact support.');
                await auth.signOut();
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="doctor-login-container">
            <div className="doctor-login-card">
                {/* Logo/Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <div className="logo-icon">+</div>
                        <div className="logo-text">DocAI Provider</div>
                    </div>
                    <h1>Doctor Login</h1>
                    <p>Access your dashboard to manage appointments and patients</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="login-form">
                    {error && (
                        <div className="error-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@docai.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <div className="demo-header">Demo Credentials:</div>
                    <div className="demo-list">
                        <div className="demo-item">
                            <strong>Cardiology:</strong> vikram.singh@docai.com
                        </div>
                        <div className="demo-item">
                            <strong>Primary Care:</strong> rajesh.sharma@docai.com
                        </div>
                        <div className="demo-item">
                            <strong>Password:</strong> DocAI@2026
                        </div>
                    </div>
                </div>

                {/* Back to Patient Portal */}
                <div className="back-link">
                    <a href="/">← Back to Patient Portal</a>
                </div>
            </div>
        </div>
    );
}
