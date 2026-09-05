import React, { useState, useEffect } from 'react';
import { MapPin, Star, ShieldCheck, Loader, Search, ArrowUpDown, Filter } from 'lucide-react';
import HospitalModal from './HospitalModal';
import { API_BASE_URL } from '../config';
import '../App.css';
import { normalizeHospitals } from '../utils/normalizeHospitals';

// High quality fallback dataset if backend API is not running
const MOCK_HOSPITALS = [
    {
        _id: 'mock-1',
        name: 'CyberMed General Hospital',
        location: 'Neo-Tokyo District',
        distance: '1.2 km',
        rating: 4.8,
        verified: true,
        phone: '+1 (555) 019-2831',
        email: 'care@cybermed.org',
        website: 'https://cybermed.org',
        description: 'State-of-the-art medical facility equipped with high-tech diagnostic suites and 24/7 care.',
        specializations: ['Radiology', 'Cardiology', 'Neurology'],
        services: [
            { name: 'MRI Scan', price: 150, originalPrice: 250, category: 'Imaging' },
            { name: 'General Checkup', price: 50, originalPrice: 80, category: 'Consultation' },
            { name: 'Blood Test', price: 25, originalPrice: 40, category: 'Laboratory' }
        ]
    },
    {
        _id: 'mock-2',
        name: 'BioHealth Diagnostics Center',
        location: 'Sector 7 Central',
        distance: '3.5 km',
        rating: 4.5,
        verified: true,
        phone: '+1 (555) 048-9102',
        email: 'info@biohealth.com',
        website: 'https://biohealth.com',
        description: 'Leading diagnostic lab specializing in rapid pathology and precise medical imaging.',
        specializations: ['Pathology', 'Diagnostic Imaging'],
        services: [
            { name: 'MRI Scan', price: 180, originalPrice: 300, category: 'Imaging' },
            { name: 'X-Ray Chest', price: 40, originalPrice: 65, category: 'Imaging' },
            { name: 'CT Scan', price: 200, originalPrice: 350, category: 'Imaging' }
        ]
    },
    {
        _id: 'mock-3',
        name: 'FutureCare Preventive Clinic',
        location: 'Downtown Core',
        distance: '0.8 km',
        rating: 4.9,
        verified: false,
        phone: '+1 (555) 077-4412',
        email: 'contact@futurecare.clinic',
        website: 'https://futurecare.clinic',
        description: 'Modern outpatient clinic focused on preventive wellness, digital prescriptions, and routine care.',
        specializations: ['Preventive Care', 'Family Medicine'],
        services: [
            { name: 'General Checkup', price: 45, originalPrice: 100, category: 'Consultation' },
            { name: 'Blood Test', price: 20, originalPrice: 35, category: 'Laboratory' },
            { name: 'Vaccination', price: 30, originalPrice: 50, category: 'Preventive Care' }
        ]
    },
    {
        _id: 'mock-4',
        name: 'Quantum Health & Surgical',
        location: 'Innovation Hub',
        distance: '5.0 km',
        rating: 4.7,
        verified: true,
        phone: '+1 (555) 091-8822',
        email: 'surgery@quantumhealth.io',
        website: 'https://quantumhealth.io',
        description: 'Advanced medical center offering robotic surgery and comprehensive emergency diagnostics.',
        specializations: ['Emergency Medicine', 'Surgery', 'Ultrasonography'],
        services: [
            { name: 'CT Scan', price: 220, originalPrice: 400, category: 'Imaging' },
            { name: 'MRI Scan', price: 160, originalPrice: 280, category: 'Imaging' },
            { name: 'Ultrasound Abdomen', price: 80, originalPrice: 120, category: 'Imaging' }
        ]
    }
];

const HospitalList = ({ searchQuery = '' }) => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('rating'); // 'rating', 'price'
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [localSearch, setLocalSearch] = useState('');

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/hospitals`);
                if (!response.ok) throw new Error('API offline');
                const data = await response.json();
                const payload = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                const normalized = normalizeHospitals(payload);
                setHospitals(normalized.length > 0 ? normalized : MOCK_HOSPITALS);
            } catch (err) {
                console.warn('Backend server not detected. Loading demo hospitals dataset.', err);
                setHospitals(MOCK_HOSPITALS);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();
    }, []);

    // Filter & Sort Logic
    const activeSearch = searchQuery || localSearch;

    const filteredHospitals = hospitals.filter(hospital => {
        // Search query matching
        const matchesSearch = !activeSearch ||
            hospital.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
            hospital.location.toLowerCase().includes(activeSearch.toLowerCase()) ||
            hospital.services.some(s => s.name.toLowerCase().includes(activeSearch.toLowerCase()));

        // Category matching
        const matchesCategory = filterCategory === 'All' ||
            hospital.services.some(s => s.category === filterCategory);

        // Verified matching
        const matchesVerified = !verifiedOnly || hospital.verified;

        return matchesSearch && matchesCategory && matchesVerified;
    }).sort((a, b) => {
        if (sortBy === 'rating') {
            return b.rating - a.rating;
        } else if (sortBy === 'price') {
            const minA = Math.min(...a.services.map(s => s.price));
            const minB = Math.min(...b.services.map(s => s.price));
            return minA - minB;
        }
        return 0;
    });

    const categories = ['All', 'Imaging', 'Consultation', 'Laboratory', 'Preventive Care'];

    return (
        <section id="hospitals" style={{ padding: '4rem 8%', maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{
                fontSize: '2.4rem',
                marginBottom: '0.5rem',
                textAlign: 'center',
                background: 'linear-gradient(90deg, #fff, var(--secondary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Compare Verified Medical Centers
            </h2>

            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2.5rem', fontSize: '1rem' }}>
                Click any hospital card to inspect complete services, specializations, and schedule appointments.
            </p>

            {/* Filter Bar Controls */}
            <div className="glass-panel" style={{
                padding: '1.2rem 1.8rem',
                marginBottom: '2.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.2rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '16px'
            }}>
                {/* Category Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Filter size={14} /> Category:
                    </span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            style={{
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                borderRadius: '20px',
                                background: filterCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                color: filterCategory === cat ? '#000' : '#ccc',
                                fontWeight: filterCategory === cat ? 'bold' : 'normal',
                                border: '1px solid ' + (filterCategory === cat ? 'var(--primary-color)' : 'var(--glass-border)')
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Verified Toggle & Sorting */}
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#ddd', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={verifiedOnly}
                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                            style={{ accentColor: 'var(--primary-color)' }}
                        />
                        Verified Only
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#aaa' }}>
                        <ArrowUpDown size={14} /> Sort:
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                background: '#121226',
                                color: '#fff',
                                border: '1px solid var(--glass-border)',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        >
                            <option value="rating">Highest Rating</option>
                            <option value="price">Lowest Starting Price</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="spin-animation" color="var(--primary-color)" size={44} />
                </div>
            ) : filteredHospitals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <p style={{ fontSize: '1.2rem' }}>No medical facilities match your filter criteria.</p>
                    <button
                        onClick={() => { setFilterCategory('All'); setVerifiedOnly(false); setLocalSearch(''); }}
                        style={{ marginTop: '1rem', background: 'var(--primary-color)', color: '#000', fontWeight: 'bold' }}
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredHospitals.map((hospital) => (
                        <div
                            key={hospital._id}
                            className="glass-panel"
                            onClick={() => setSelectedHospital(hospital)}
                            style={{
                                padding: '1.6rem',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px var(--primary-glow)';
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>{hospital.name}</h3>
                                    {hospital.verified && <ShieldCheck color="var(--primary-color)" size={22} title="Verified Hospital" />}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', marginBottom: '0.8rem', fontSize: '0.88rem' }}>
                                    <MapPin size={15} color="var(--primary-color)" />
                                    <span>{hospital.location} ({hospital.distance})</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                                    <Star fill="#FFD700" color="#FFD700" size={16} />
                                    <span style={{ color: '#fff', fontWeight: '600' }}>{hospital.rating}</span>
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>(Verified Reviews)</span>
                                </div>

                                {/* Services Preview */}
                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.6rem', fontWeight: '600' }}>
                                        Popular Services & Pricing:
                                    </p>
                                    {hospital.services.slice(0, 3).map((service, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.88rem',
                                            marginBottom: '0.4rem'
                                        }}>
                                            <span style={{ color: '#ddd' }}>{service.name}</span>
                                            <span>
                                                <span style={{ textDecoration: 'line-through', color: '#666', marginRight: '6px', fontSize: '0.8rem' }}>
                                                    ${service.originalPrice}
                                                </span>
                                                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                                    ${service.price}
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                marginTop: '1.5rem',
                                paddingTop: '0.8rem',
                                borderTop: '1px dashed var(--glass-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.85rem',
                                color: 'var(--primary-color)',
                                fontWeight: '600'
                            }}>
                                <span>Inspect Full Facility & Pricing</span>
                                <span>&rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <HospitalModal
                hospital={selectedHospital}
                onClose={() => setSelectedHospital(null)}
            />
        </section>
    );
};

export default HospitalList;
