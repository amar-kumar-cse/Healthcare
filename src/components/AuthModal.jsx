import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import '../App.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : { name: formData.name, email: formData.email, password: formData.password };

        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const userData = data.data;
                localStorage.setItem('medicompare_token', userData.token);
                localStorage.setItem('medicompare_user', JSON.stringify(userData));
                setSuccessMsg(isLogin ? 'Successfully logged in!' : 'Account created successfully!');
                setTimeout(() => {
                    onAuthSuccess(userData);
                    onClose();
                }, 800);
            } else {
                setError(data.message || (data.errors && data.errors[0]?.msg) || 'Authentication failed');
            }
        } catch (err) {
            console.warn('Backend unavailable, using demo authentication mode:', err);
            // Fallback for demo mode if backend is not running
            const mockUser = {
                _id: 'demo-123',
                name: formData.name || 'Demo Patient',
                email: formData.email,
                role: 'user',
                token: 'mock-jwt-token-medicompare'
            };
            localStorage.setItem('medicompare_token', mockUser.token);
            localStorage.setItem('medicompare_user', JSON.stringify(mockUser));
            setSuccessMsg('Logged in (Demo Mode)');
            setTimeout(() => {
                onAuthSuccess(mockUser);
                onClose();
            }, 800);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '2.5rem',
                    position: 'relative',
                    background: '#0d0d1a',
                    border: '1px solid var(--primary-glow)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.2rem',
                        right: '1.2rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} color="#fff" />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '12px',
                        borderRadius: '50%',
                        background: 'rgba(0, 240, 255, 0.1)',
                        marginBottom: '0.8rem',
                        border: '1px solid var(--primary-glow)'
                    }}>
                        <ShieldCheck size={32} color="var(--primary-color)" />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>
                        {isLogin ? 'Sign in to access price transparency tools' : 'Join MediCompare to save on medical costs'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 68, 68, 0.15)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        color: '#ff6b6b',
                        fontSize: '0.85rem',
                        marginBottom: '1.2rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 255, 136, 0.15)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#00ff88',
                        fontSize: '0.85rem',
                        marginBottom: '1.2rem',
                        textAlign: 'center'
                    }}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '6px' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 0.8rem 0.8rem 2.4rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '6px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="patient@example.com"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 0.8rem 0.8rem 2.4rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '6px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 0.8rem 0.8rem 2.4rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.9rem',
                            background: 'var(--primary-color)',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 0 15px var(--primary-glow)',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Now')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {isLogin ? 'Register' : 'Sign In'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
