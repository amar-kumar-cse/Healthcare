import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../App.css';

const ImageUpload = ({ onFindHospital }) => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'scanning', 'success', 'error'
    const [message, setMessage] = useState('');
    const [aiResult, setAiResult] = useState(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadStatus(null);
            setAiResult(null);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus(null);
            setAiResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploadStatus('uploading');
        setMessage('Uploading report to secure server...');

        try {
            const formData = new FormData();
            formData.append('medicalReport', file);

            const response = await fetch(`${API_BASE_URL}/api/upload/medical-report`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Upload failed');
            }

            setUploadStatus('success');
            setMessage('Report Analyzed Successfully!');
            setAiResult(data.data.analysis);
        } catch (err) {
            console.warn('Upload failed:', err);
            setUploadStatus('error');
            setMessage(err.message || 'Upload failed');
        }
    };

    return (
        <section id="upload" style={{ padding: '4rem 8%', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span className="badge badge-category" style={{ marginBottom: '0.8rem' }}>
                    <Sparkles size={14} /> Report Analysis
                </span>
                <h2 style={{
                    fontSize: '2.4rem',
                    marginBottom: '0.5rem',
                    color: '#fff'
                }}>
                    Upload Prescription or Medical Bill
                </h2>
                <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                    We extract file-specific signals from the uploaded report and match likely procedures across partner hospitals.
                </p>
            </div>

            <div className="glass-panel" style={{
                padding: '3rem 2rem',
                border: dragging ? '2px dashed var(--primary-color)' : '2px dashed var(--glass-border)',
                borderRadius: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: dragging ? 'rgba(0, 240, 255, 0.05)' : 'rgba(10, 10, 20, 0.6)'
            }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                />

                {uploadStatus === 'scanning' && <div className="scanner-line" />}

                {!file ? (
                    <>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'rgba(0, 240, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.2rem',
                            border: '1px solid var(--primary-glow)'
                        }}>
                            <Upload size={32} color={dragging ? 'var(--primary-color)' : '#888'} />
                        </div>
                        <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem' }}>
                            Drag & Drop report file or <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Browse</span>
                        </p>
                        <p style={{ fontSize: '0.88rem', color: '#666' }}>
                            Supports JPG, PNG, WEBP, and PDF documents (Max 5MB)
                        </p>
                    </>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <FileText size={52} color="var(--primary-color)" style={{ marginBottom: '0.8rem' }} />
                        <p style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '600', marginBottom: '0.4rem' }}>
                            {file.name}
                        </p>
                        <p style={{ fontSize: '0.88rem', color: '#888', marginBottom: '1.2rem' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {/* Reset File Button */}
                        <button style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            background: 'rgba(255,0,0,0.2)',
                            border: '1px solid rgba(255,0,0,0.4)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setUploadStatus(null);
                                setAiResult(null);
                            }}
                        >
                            <X size={16} color="#ff4444" />
                        </button>

                        {uploadStatus === 'uploading' && (
                            <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.95rem' }}>
                                {message}
                            </div>
                        )}

                        {uploadStatus === 'scanning' && (
                            <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Sparkles size={18} className="spin-animation" /> {message}
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div style={{ color: '#00ff88', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <CheckCircle size={20} /> {message}
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div style={{ color: '#ff4444', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <AlertCircle size={20} /> {message}
                            </div>
                        )}

                        {!uploadStatus && (
                            <button
                                style={{
                                    marginTop: '0.5rem',
                                    background: 'var(--primary-color)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.8rem 2.2rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 20px var(--primary-glow)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload();
                                }}
                            >
                                Run AI Price Extractor
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Render AI Result Breakdown Card */}
            {aiResult && (
                <div className="glass-panel animate-fade-in" style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid var(--accent-color)',
                    background: 'rgba(0, 255, 136, 0.03)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <span className="badge badge-verified" style={{ marginBottom: '4px' }}>
                                Confidence: {aiResult.confidence}
                            </span>
                            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 0 0', color: '#fff' }}>
                                Detected: {aiResult.detectedProcedure}
                            </h3>
                            <div style={{ marginTop: '6px', color: '#8f9bb3', fontSize: '0.85rem' }}>
                                Signals: {Array.isArray(aiResult.signals) ? aiResult.signals.join(', ') : 'n/a'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Potential Savings</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                                Save ${aiResult.potentialSavings}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.2rem',
                        marginBottom: '1.5rem',
                        padding: '1.2rem',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '12px'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Market Average</div>
                            <div style={{ fontSize: '1.2rem', color: '#888', textDecoration: 'line-through' }}>
                                ${aiResult.averageMarketPrice}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Lowest Verified Price</div>
                            <div style={{ fontSize: '1.4rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                ${aiResult.lowestAvailablePrice}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Top Value Medical Center</div>
                            <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={16} color="var(--primary-color)" /> {aiResult.recommendedHospital}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (onFindHospital) onFindHospital(aiResult.detectedProcedure || 'Medical Report');
                            const hospitalElem = document.getElementById('hospitals');
                            if (hospitalElem) hospitalElem.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                            width: '100%',
                            background: 'var(--primary-color)',
                            color: '#000',
                            fontWeight: 'bold',
                            padding: '0.9rem',
                            fontSize: '1rem',
                            borderRadius: '10px',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        View & Book Lowest Price Hospital <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </section>
    );
};

export default ImageUpload;
