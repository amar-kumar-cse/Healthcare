import React from 'react';
import { Shield, Zap, TrendingDown, Brain } from 'lucide-react';
import '../App.css';

const Features = () => {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Analysis',
            description: 'Our advanced AI analyzes your medical needs and finds the best prices automatically.'
        },
        {
            icon: TrendingDown,
            title: 'Save Up to 40%',
            description: 'Compare prices across 50+ hospitals and save thousands on medical procedures.'
        },
        {
            icon: Shield,
            title: 'Verified Hospitals',
            description: 'All hospitals are verified and certified for quality healthcare services.'
        },
        {
            icon: Zap,
            title: 'Instant Results',
            description: 'Get real-time price comparisons in under 200ms with our optimized search.'
        }
    ];

    return (
        <section id="features" style={{ padding: '5rem 10%', background: 'rgba(0,0,0,0.3)' }}>
            <h2 style={{
                fontSize: '2.5rem',
                marginBottom: '3rem',
                textAlign: 'center',
                background: 'linear-gradient(90deg, var(--primary-color), #fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Why Choose MediCompare?
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {features.map((feature, idx) => (
                    <div key={idx} className="glass-panel" style={{
                        padding: '2rem',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                        }}
                    >
                        <feature.icon size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#fff' }}>
                            {feature.title}
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6' }}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
