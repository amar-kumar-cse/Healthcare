import React, { useState } from 'react';
import { X, MapPin, Star, ShieldCheck, Phone, Mail, Globe, Calendar, CheckCircle2, DollarSign } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../App.css';

const HospitalModal = ({ hospital, onClose }) => {
    const [bookingService, setBookingService] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [patientName, setPatientName] = useState(() => {
        try {
            const savedUser = localStorage.getItem('medicompare_user');
            return savedUser ? (JSON.parse(savedUser).name || '') : '';
        } catch {
            return '';
        }
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingResult, setBookingResult] = useState(null);

    if (!hospital) return null;

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!bookingService) return;

        setBookingLoading(true);
        setBookingError('');
        setBookingResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    hospitalId: hospital._id,
                    serviceName: bookingService.name,
                    servicePrice: bookingService.price,
                    patientName,
                    preferredDate: bookingDate,
                    notes: `Booked from ${hospital.name} card`
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Booking request failed');
            }

            setBookingResult(data.data);
            setTimeout(() => {
                setBookingService(null);
                setBookingResult(null);
                setBookingDate('');
            }, 3500);
        } catch (error) {
            setBookingError(error.message || 'Booking request failed');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '750px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2rem',
                    position: 'relative',
                    background: '#0a0a14',
                    border: '1px solid var(--primary-glow)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.2rem',
                        right: '1.2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} color="#fff" />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{hospital.name}</h2>
                        {hospital.verified && (
                            <span className="badge badge-verified">
                                <ShieldCheck size={14} /> Verified Facility
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: '#aaa', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16} color="var(--primary-color)" /> {hospital.location} ({hospital.distance})
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFD700' }}>
                            <Star size={16} fill="#FFD700" color="#FFD700" /> {hospital.rating} / 5.0
                        </span>
                    </div>
                </div>

                {/* Description & Contact Details */}
                <div style={{
                    padding: '1.2rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ color: '#ccc', marginBottom: '1rem', lineHeight: '1.5' }}>
                        {hospital.description || 'Top tier healthcare facility dedicated to medical excellence and patient transparency.'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', fontSize: '0.88rem', color: '#aaa' }}>
                        {hospital.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={15} color="var(--primary-color)" /> {hospital.phone}
                            </div>
                        )}
                        {hospital.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={15} color="var(--primary-color)" /> {hospital.email}
                            </div>
                        )}
                        {hospital.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={15} color="var(--primary-color)" />
                                <a href={hospital.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                                    Official Website
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Specializations & Amenities */}
                {hospital.specializations && hospital.specializations.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.6rem' }}>Specializations</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {hospital.specializations.map((spec, i) => (
                                <span key={i} className="badge badge-category">{spec}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Procedure & Service Price Transparency Table */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign color="var(--accent-color)" size={20} /> Transparency Pricing & Services
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#888' }}>
                                    <th style={{ padding: '10px' }}>Service</th>
                                    <th style={{ padding: '10px' }}>Category</th>
                                    <th style={{ padding: '10px' }}>Standard Price</th>
                                    <th style={{ padding: '10px' }}>MediCompare Price</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospital.services && hospital.services.map((service, idx) => {
                                    const savings = service.originalPrice - service.price;
                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px 10px', fontWeight: '600', color: '#fff' }}>{service.name}</td>
                                            <td style={{ padding: '12px 10px', color: '#aaa' }}>{service.category || 'General'}</td>
                                            <td style={{ padding: '12px 10px', color: '#666', textDecoration: 'line-through' }}>${service.originalPrice}</td>
                                            <td style={{ padding: '12px 10px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                                ${service.price}
                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginLeft: '6px' }}>
                                                    (Save ${savings})
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setBookingService(service)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '0.8rem',
                                                        background: 'var(--primary-color)',
                                                        color: '#000',
                                                        fontWeight: 'bold',
                                                        border: 'none',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    Book Service
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Appointment Booking Sub-modal */}
                {bookingService && (
                    <div style={{
                        padding: '1.2rem',
                        background: 'rgba(0, 240, 255, 0.05)',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '12px',
                        marginTop: '1.5rem'
                    }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} /> Book Appointment: {bookingService.name} (${bookingService.price})
                        </h4>

                        {bookingError && (
                            <div style={{ color: '#ff6b6b', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                {bookingError}
                            </div>
                        )}

                        {bookingResult ? (
                            <div style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
                                <CheckCircle2 size={20} /> Booking request submitted. Ref: {bookingResult._id}
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Patient Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>Preferred Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button type="submit" disabled={bookingLoading} style={{ background: 'var(--accent-color)', color: '#000', fontWeight: 'bold', border: 'none', padding: '8px 16px', opacity: bookingLoading ? 0.7 : 1 }}>
                                        {bookingLoading ? 'Submitting...' : 'Confirm'}
                                    </button>
                                    <button type="button" onClick={() => { setBookingService(null); setBookingError(''); setBookingResult(null); }} style={{ background: 'transparent', color: '#aaa', border: '1px solid #444', padding: '8px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalModal;
