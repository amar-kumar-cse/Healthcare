import React, { useState } from 'react';
import '../App.css';
import { Search, Sparkles } from 'lucide-react';

const Hero = ({ onSearchQuery }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (onSearchQuery) {
            onSearchQuery(searchTerm);
        }
        const hospitalSection = document.getElementById('hospitals');
        if (hospitalSection) {
            hospitalSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleQuickSearch = (term) => {
        setSearchTerm(term);
        if (onSearchQuery) {
            onSearchQuery(term);
        }
        const hospitalSection = document.getElementById('hospitals');
        if (hospitalSection) {
            hospitalSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section style={{
            minHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '100px',
            paddingBottom: '2rem'
        }}>
            {/* Ambient Background Graphic */}
            <div style={{
                position: 'absolute',
                width: '550px',
                height: '550px',
                background: 'radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)',
                filter: 'blur(70px)',
                zIndex: -1,
                top: '15%',
                animation: 'pulse 8s infinite alternate'
            }} />

            <div className="badge badge-verified animate-fade-in" style={{ marginBottom: '1.2rem', padding: '6px 14px', fontSize: '0.85rem' }}>
                <Sparkles size={16} /> Transparent Medical Pricing Across Hospitals
            </div>

            <h1 className="hero-title" style={{
                fontSize: '3.6rem',
                textAlign: 'center',
                marginBottom: '1rem',
                lineHeight: 1.15,
                textShadow: '0 0 20px rgba(0,0,0,0.6)'
            }}>
                Next-Gen <span style={{ color: 'var(--primary-color)', textShadow: '0 0 20px var(--primary-glow)' }}>Healthcare</span><br />
                Price Transparency
            </h1>

            <p style={{
                fontSize: '1.15rem',
                color: '#aaa',
                maxWidth: '620px',
                textAlign: 'center',
                marginBottom: '2.2rem',
                lineHeight: '1.6'
            }}>
                Compare procedure & test costs across 50+ verified medical centers in real time.
                Save up to <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>40%</span> on out-of-pocket expenses.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem 0.6rem 0.4rem 1.2rem',
                width: '92%',
                maxWidth: '560px',
                border: '1px solid var(--primary-color)',
                boxShadow: '0 0 20px var(--primary-glow)',
                borderRadius: '50px'
            }}>
                <Search color="var(--primary-color)" size={22} style={{ flexShrink: 0 }} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search procedures (MRI, Blood Test, Checkup)..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.02rem',
                        flex: 1,
                        padding: '0.8rem 0.6rem',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: 'var(--primary-color)',
                        color: '#000',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '30px',
                        padding: '0.75rem 1.6rem',
                        boxShadow: '0 0 10px var(--primary-glow)',
                        cursor: 'pointer'
                    }}
                >
                    Compare
                </button>
            </form>

            {/* Quick Suggestion Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1.2rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#777', alignSelf: 'center' }}>Popular:</span>
                {['MRI Scan', 'Blood Test', 'General Checkup', 'CT Scan', 'Ultrasound'].map((term) => (
                    <button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '4px 12px',
                            fontSize: '0.8rem',
                            color: '#ccc',
                            cursor: 'pointer'
                        }}
                    >
                        {term}
                    </button>
                ))}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.4; transform: scale(0.85); }
                    100% { opacity: 0.9; transform: scale(1.15); }
                }
            `}</style>
        </section>
    );
};

export default Hero;
