import React, { useRef, useEffect } from 'react';
import '../profile.css';

export const Icons = {
    Home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    Meds: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"></path><path d="M8.5 8.5l7 7"></path></svg>,
    Doctor: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path><path d="M12 11h.01"></path><path d="M12 7h.01"></path><path d="M16 16h2"></path><path d="M17 14v4"></path></svg>,
    Stores: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l2-5h14l2 5"></path><path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path><path d="M9 22v-8h6v8"></path></svg>,
    Records: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

export default function Layout({ children, currentView, onViewChange, userProfile, onLogout }) {
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    return (
        <>
            <header className={`header ${currentView === 'stores' ? 'hide-on-mobile' : ''}`}>
                <div className="logo" onClick={() => onViewChange('home')} style={{ cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
                        <path d="M12 8V16" />
                        <path d="M8 12H16" />
                    </svg>
                    <span>DocAI</span>
                </div>

                <nav className="desktop-nav">
                    <a className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => onViewChange('home')}>Start Here</a>
                    <a className={`nav-link ${currentView === 'meds' ? 'active' : ''}`} onClick={() => onViewChange('meds')}>Medication</a>
                    <a className={`nav-link ${currentView === 'doctor' ? 'active' : ''}`} onClick={() => onViewChange('doctor')}>My Doctor</a>
                    <a className={`nav-link ${currentView === 'stores' ? 'active' : ''}`} onClick={() => onViewChange('stores')}>Availability</a>
                    <a className={`nav-link ${currentView === 'records' ? 'active' : ''}`} onClick={() => onViewChange('records')}>Records</a>
                </nav>

                {userProfile && (
                    <div className="profile-container" style={{ position: 'relative' }} ref={profileRef}>
                        <div
                            className="profile-trigger"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                background: 'rgba(255,255,255,0.15)',
                                padding: '6px 12px',
                                borderRadius: 30,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'white',
                                color: 'var(--primary-teal)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: 14
                            }}>
                                {userProfile.name[0]}
                            </div>
                            <span style={{ color: 'white', fontWeight: 500, fontSize: 14 }}>{userProfile.name.split(' ')[0]}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="profile-header">
                                    <div className="profile-avatar-large">
                                        {userProfile.name[0]}
                                    </div>
                                    <div className="profile-info">
                                        <h4>{userProfile.name}</h4>
                                        <div className="profile-badges">
                                            <span className="badge">{userProfile.age} yrs</span>
                                            <span className="badge">{userProfile.gender}</span>
                                            <span className="badge blood">{userProfile.blood_group}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-details">
                                    <div className="detail-item">
                                        <span className="icon">📞</span>
                                        <span>{userProfile.phone || 'No phone'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">📧</span>
                                        <span>{userProfile.email || 'No email'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">📍</span>
                                        <span>{userProfile.address || 'No address'}</span>
                                    </div>
                                </div>

                                <div className="profile-actions">
                                    <button className="logout-btn" onClick={() => {
                                        setShowProfileMenu(false);
                                        onLogout();
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <main className="main-container">
                {children}
            </main>

            <nav className="mobile-bottom-nav">
                <a className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => onViewChange('home')}>{Icons.Home}<span>Home</span></a>
                <a className={`mobile-nav-item ${currentView === 'meds' ? 'active' : ''}`} onClick={() => onViewChange('meds')}>{Icons.Meds}<span>Meds</span></a>
                <a className={`mobile-nav-item ${currentView === 'doctor' ? 'active' : ''}`} onClick={() => onViewChange('doctor')}>{Icons.Doctor}<span>My Doc</span></a>
                <a className={`mobile-nav-item ${currentView === 'stores' ? 'active' : ''}`} onClick={() => onViewChange('stores')}>{Icons.Stores}<span>Stores</span></a>
                <a className={`mobile-nav-item ${currentView === 'records' ? 'active' : ''}`} onClick={() => onViewChange('records')}>{Icons.Records}<span>Records</span></a>
            </nav>
        </>
    );
}
