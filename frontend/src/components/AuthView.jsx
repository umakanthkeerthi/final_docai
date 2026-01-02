import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AuthView({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login, signup, loginWithGoogle, currentUser } = useAuth();

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                console.log('Attempting login...');
                await login(formData.email, formData.password);
                console.log('Login successful');
            } else {
                console.log('Attempting signup...');
                // Sign up with additional info
                const userCredential = await signup(formData.email, formData.password);
                console.log('Signup successful, saving user data...');

                // Store additional user info in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    profiles: [],
                    createdAt: new Date().toISOString()
                });
                console.log('User data saved');
            }
            onLoginSuccess({ email: formData.email });
        } catch (err) {
            console.error('Auth error:', err);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);

            // User-friendly error messages
            let errorMessage = 'Authentication failed';
            if (err.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
            onLoginSuccess({ email: 'Google User' });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Google login failed');
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
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'auto'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }}></div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 24,
                padding: '48px',
                width: '100%',
                maxWidth: isLogin ? 420 : 520,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 1,
                margin: '20px auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        fontSize: 48,
                        marginBottom: 16,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}>🩺</div>
                    <h1 style={{
                        color: '#0f766e',
                        margin: '0 0 8px',
                        fontSize: 32,
                        fontWeight: 700
                    }}>
                        {isLogin ? 'Welcome Back' : 'Join DocAI'}
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>
                        {isLogin ? 'Sign in to access your health dashboard' : 'Create your account to get started'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#374151',
                            fontSize: 14,
                            fontWeight: 600
                        }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: 12,
                                fontSize: 15,
                                transition: 'all 0.2s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#374151',
                            fontSize: 14,
                            fontWeight: 600
                        }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: 12,
                                fontSize: 15,
                                transition: 'all 0.2s',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 12,
                                        fontSize: 15,
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    color: '#374151',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full address"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 12,
                                        fontSize: 15,
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: 12,
                            marginBottom: 20,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: 16,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.4)';
                        }}
                    >
                        {loading ? '⏳ Processing...' : (isLogin ? '🔓 Sign In' : '🚀 Create Account')}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        margin: '20px 0',
                        color: '#9ca3af',
                        fontSize: 14,
                        fontWeight: 600,
                        position: 'relative'
                    }}>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '0 12px',
                            position: 'relative',
                            zIndex: 1
                        }}>OR</span>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: '#e5e7eb',
                            zIndex: 0
                        }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'white',
                            color: '#374151',
                            border: '2px solid #e5e7eb',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.borderColor = '#14b8a6';
                                e.target.style.background = '#f9fafb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.background = 'white';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#14b8a6',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            {isLogin ? "Don't have an account? Sign Up →" : "Already have an account? Sign In →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
