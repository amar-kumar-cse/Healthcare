import React, { useState, useEffect } from 'react';
import { Activity, Menu, X, UserCheck, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';
import '../App.css';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('medicompare_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.error(err);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('medicompare_token');
        localStorage.removeItem('medicompare_user');
        setUser(null);
    };

    return (
        <>
            <nav className="glass-panel" style={{
                position: 'fixed',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '92%',
                maxWidth: '1200px',
                padding: '0.8rem 1.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity color="var(--primary-color)" size={28} />
                    <a href="#" style={{ textDecoration: 'none' }}>
                        <h1 style={{
                            fontSize: '1.4rem',
                            background: 'linear-gradient(90deg, #fff, var(--primary-color))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>MediCompare</h1>
                    </a>
                </div>

                {/* Desktop Nav Links */}
                <div className="nav-desktop" style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
                    {['Features', 'Hospitals', 'Upload', 'Stats'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{
                            color: 'rgba(255,255,255,0.85)',
                            textDecoration: 'none',
                            fontSize: '0.92rem',
                            fontWeight: '500',
                            transition: 'color 0.3s'
                        }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.85)'}
                        >
                            {item}
                        </a>
                    ))}

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(0, 240, 255, 0.1)',
                                border: '1px solid var(--primary-glow)',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.88rem',
                                color: '#fff'
                            }}>
                                <UserCheck size={16} color="var(--primary-color)" />
                                <span>{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,68,68,0.4)',
                                    color: '#ff6b6b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            style={{
                                background: 'var(--primary-color)',
                                color: '#000',
                                fontWeight: 'bold',
                                border: 'none',
                                padding: '0.6rem 1.4rem',
                                borderRadius: '8px',
                                boxShadow: '0 0 12px var(--primary-glow)',
                                cursor: 'pointer'
                            }}
                        >
                            Sign In / Register
                        </button>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="nav-mobile-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        padding: '4px'
                    }}
                >
                    {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </nav>

            {/* Mobile Drawer Navigation */}
            {mobileMenuOpen && (
                <div
                    className="glass-panel animate-fade-in"
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: '4%',
                        right: '4%',
                        padding: '1.5rem',
                        zIndex: 999,
                        background: '#0d0d1a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center'
                    }}
                >
                    {['Features', 'Hospitals', 'Upload', 'Stats'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: '1.1rem',
                                padding: '0.5rem 0'
                            }}
                        >
                            {item}
                        </a>
                    ))}
                    {user ? (
                        <button
                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                            style={{ width: '100%', background: 'rgba(255,68,68,0.2)', color: '#ff6b6b', border: '1px solid #ff4444' }}
                        >
                            Sign Out ({user.name})
                        </button>
                    ) : (
                        <button
                            onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                            style={{ width: '100%', background: 'var(--primary-color)', color: '#000', fontWeight: 'bold' }}
                        >
                            Sign In / Register
                        </button>
                    )}
                </div>
            )}

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onAuthSuccess={(userData) => setUser(userData)}
            />
        </>
    );
};

export default Navbar;
