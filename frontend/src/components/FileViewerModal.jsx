import React from 'react';
import { API_BASE } from '../config';

export default function FileViewerModal({ isOpen, onClose, record }) {
    if (!isOpen || !record) return null;

    const isImage = record.data?.file_type?.startsWith('image/');
    const isPDF = record.data?.file_type === 'application/pdf';
    const fileUrl = `${API_BASE}/files/${record.data?.stored_filename}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
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
                maxWidth: 900,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#1a202c',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {record.data?.filename || 'Medical Document'}
                        </h2>
                        <p style={{ margin: '5px 0 0', fontSize: 13, color: '#718096' }}>
                            {record.data?.category?.replace('_', ' ').toUpperCase()} • {(record.data?.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f7fafc',
                            border: 'none',
                            borderRadius: 8,
                            width: 36,
                            height: 36,
                            cursor: 'pointer',
                            fontSize: 20,
                            color: '#718096',
                            marginLeft: 16,
                            flexShrink: 0
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Notes Section (if exists) */}
                {record.data?.notes && (
                    <div style={{
                        padding: '12px 24px',
                        background: '#f7fafc',
                        borderBottom: '1px solid #e2e8f0',
                        flexShrink: 0
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: 13,
                            color: '#4a5568',
                            fontStyle: 'italic'
                        }}>
                            📝 {record.data.notes}
                        </p>
                    </div>
                )}

                {/* File Viewer */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    {isImage ? (
                        <img
                            src={fileUrl}
                            alt={record.data?.filename}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: 12,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    ) : isPDF ? (
                        <iframe
                            src={fileUrl}
                            title={record.data?.filename}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: 12,
                                minHeight: 500
                            }}
                        />
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 40
                        }}>
                            <div style={{ fontSize: 60, marginBottom: 16 }}>📄</div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px', color: '#1a202c' }}>
                                Preview Not Available
                            </h3>
                            <p style={{ fontSize: 14, color: '#718096', marginBottom: 20 }}>
                                This file type cannot be previewed in the browser
                            </p>
                            <a
                                href={fileUrl}
                                download={record.data?.filename}
                                style={{
                                    display: 'inline-block',
                                    background: '#3182ce',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}
                            >
                                ⬇️ Download File
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-end',
                    flexShrink: 0
                }}>
                    <a
                        href={fileUrl}
                        download={record.data?.filename}
                        style={{
                            background: '#f7fafc',
                            border: '2px solid #e2e8f0',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#4a5568',
                            textDecoration: 'none',
                            display: 'inline-block'
                        }}
                    >
                        ⬇️ Download
                    </a>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#3182ce',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
