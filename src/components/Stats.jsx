import React from 'react';
import { Heart, Users, Award, TrendingUp } from 'lucide-react';
import '../App.css';

const Stats = () => {
    const stats = [
        { icon: Users, value: '2,000+', label: 'Active Users' },
        { icon: Heart, value: '50+', label: 'Partner Hospitals' },
        { icon: Award, value: '500+', label: 'Appointments Booked' },
        { icon: TrendingUp, value: '40%', label: 'Average Savings' }
    ];

    return (
        <section style={{ padding: '4rem 10%' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                        <stat.icon size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{
                            fontSize: '2.5rem',
                            color: '#fff',
                            marginBottom: '0.5rem',
                            textShadow: '0 0 20px var(--primary-glow)'
                        }}>
                            {stat.value}
                        </h3>
                        <p style={{ color: '#888', fontSize: '1rem' }}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Stats;
