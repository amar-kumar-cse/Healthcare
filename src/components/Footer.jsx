import React from 'react';
import { Activity, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import '../App.css';

const Footer = () => {
    return (
        <footer style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '3rem 10%',
            borderTop: '1px solid var(--glass-border)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '3rem',
                maxWidth: '1200px',
                margin: '0 auto 2rem'
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <Activity color="var(--primary-color)" size={28} />
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>MediCompare</h3>
                    </div>
                    <p style={{ color: '#aaa', lineHeight: 1.6 }}>
                        Next-generation healthcare price transparency platform powered by AI.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#fff' }}>Quick Links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['Features', 'Hospitals', 'Pricing', 'About'].map((link) => (
                            <a key={link} href={`#${link.toLowerCase()}`} style={{
                                color: '#aaa',
                                textDecoration: 'none',
                                transition: 'color 0.3s'
                            }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                                onMouseLeave={(e) => e.target.style.color = '#aaa'}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#fff' }}>Contact Us</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa' }}>
                            <Mail size={18} color="var(--primary-color)" />
                            info@medicompare.com
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa' }}>
                            <Phone size={18} color="var(--primary-color)" />
                            +1 (555) 123-4567
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa' }}>
                            <MapPin size={18} color="var(--primary-color)" />
                            San Francisco, CA
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#fff' }}>Follow Us</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[Github, Twitter, Linkedin].map((Icon, idx) => (
                            <a key={idx} href="#" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                    e.currentTarget.style.background = 'var(--glass-bg)';
                                }}
                            >
                                <Icon size={20} color="#aaa" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div style={{
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '2rem',
                textAlign: 'center',
                color: '#666'
            }}>
                <p>© 2026 MediCompare. All rights reserved. Built with AI & React.</p>
            </div>
        </footer>
    );
};

export default Footer;
