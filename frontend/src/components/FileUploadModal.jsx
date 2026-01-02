import React, { useState } from 'react';
import { API_BASE } from '../config';

const FILE_CATEGORIES = [
    { id: 'prescription', label: '💊 Prescription', icon: '💊', color: '#10b981' },
    { id: 'blood_test', label: '🩸 Blood Test Report', icon: '🩸', color: '#ef4444' },
    { id: 'xray', label: '🦴 X-Ray / Scan', icon: '🦴', color: '#3b82f6' },
    { id: 'lab_report', label: '🔬 Lab Report', icon: '🔬', color: '#8b5cf6' },
    { id: 'vaccination', label: '💉 Vaccination Record', icon: '💉', color: '#f59e0b' },
    { id: 'discharge_summary', label: '📋 Discharge Summary', icon: '📋', color: '#06b6d4' },
    { id: 'other', label: '📄 Other Document', icon: '📄', color: '#6b7280' }
];

export default function FileUploadModal({ isOpen, onClose, currentUser, selectedProfile, onUploadSuccess }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload an image (JPG, PNG, WEBP) or PDF file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedCategory || !selectedFile) {
            alert('Please select a category and file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('user_id', currentUser.uid);
            formData.append('profile_id', selectedProfile?.id || currentUser.uid);
            formData.append('category', selectedCategory);
            formData.append('notes', notes.trim() || '');

            const response = await fetch(`${API_BASE}/upload-medical-file`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('File uploaded successfully!');
                onUploadSuccess?.();
                handleClose();
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedCategory(null);
        setSelectedFile(null);
        setFilePreview(null);
        setNotes('');
        setDragActive(false);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
        }}>
            <div style={{
                background: 'white',
                borderRadius: 20,
                maxWidth: 600,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 24px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a202c' }}>
                            📤 Upload Medical Document
                        </h2>
                        <p style={{ margin: '5px 0 0', fontSize: 14, color: '#718096' }}>
                            {selectedProfile ? `For ${selectedProfile.name}` : 'Add to your records'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: '#f7fafc',
                            border: 'none',
                            borderRadius: 8,
                            width: 32,
                            height: 32,
                            cursor: 'pointer',
                            fontSize: 18,
                            color: '#718096'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Step 1: Select Category */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a202c' }}>
                            1. Select Document Type
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 10
                        }}>
                            {FILE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={{
                                        background: selectedCategory === cat.id ? cat.color : 'white',
                                        color: selectedCategory === cat.id ? 'white' : '#1a202c',
                                        border: selectedCategory === cat.id ? 'none' : '2px solid #e2e8f0',
                                        borderRadius: 12,
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                                    <span style={{ flex: 1, fontSize: 13 }}>
                                        {cat.label.replace(/^[^\s]+\s/, '')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Upload File */}
                    {selectedCategory && (
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a202c' }}>
                                2. Upload File
                            </h3>

                            {!selectedFile ? (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    style={{
                                        border: dragActive ? '3px dashed #3182ce' : '2px dashed #cbd5e0',
                                        borderRadius: 16,
                                        padding: 40,
                                        textAlign: 'center',
                                        background: dragActive ? '#ebf8ff' : '#f7fafc',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                                    <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', color: '#1a202c' }}>
                                        Drag & drop your file here
                                    </p>
                                    <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                                        or click to browse
                                    </p>
                                    <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 12 }}>
                                        Supports: JPG, PNG, WEBP, PDF (max 10MB)
                                    </p>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 16,
                                    padding: 16,
                                    background: '#f7fafc'
                                }}>
                                    {filePreview && (
                                        <div style={{
                                            marginBottom: 12,
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            maxHeight: 200
                                        }}>
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a202c' }}>
                                                {selectedFile.name}
                                            </p>
                                            <p style={{ fontSize: 12, color: '#718096', margin: '4px 0 0' }}>
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setFilePreview(null);
                                            }}
                                            style={{
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '8px 12px',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                color: '#991b1b'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Add Notes (Optional) */}
                    {selectedFile && (
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a202c' }}>
                                3. Add Notes (Optional)
                            </h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes about this document..."
                                style={{
                                    width: '100%',
                                    minHeight: 80,
                                    padding: 12,
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button
                            onClick={handleClose}
                            disabled={uploading}
                            style={{
                                flex: 1,
                                background: '#f7fafc',
                                border: '2px solid #e2e8f0',
                                borderRadius: 12,
                                padding: '12px 20px',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                color: '#718096',
                                opacity: uploading ? 0.5 : 1
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedCategory || !selectedFile || uploading}
                            style={{
                                flex: 1,
                                background: (!selectedCategory || !selectedFile || uploading) ? '#cbd5e0' : '#3182ce',
                                border: 'none',
                                borderRadius: 12,
                                padding: '12px 20px',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: (!selectedCategory || !selectedFile || uploading) ? 'not-allowed' : 'pointer',
                                color: 'white',
                                boxShadow: (!selectedCategory || !selectedFile || uploading) ? 'none' : '0 4px 12px rgba(49, 130, 206, 0.3)'
                            }}
                        >
                            {uploading ? '⏳ Uploading...' : '📤 Upload Document'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
