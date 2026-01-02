import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PharmacyMap() {
    const { t } = useTranslation();
    const [selectedStore, setSelectedStore] = useState(null);
    const [sheetHeight, setSheetHeight] = useState(35); // Start smaller - 35%
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const pharmacies = [
        {
            id: 1,
            name: "MedPlus Pharmacy",
            address: "123 Main Street, Downtown",
            stock: "In Stock",
            dist: "0.3 km",
            time: "5 min",
            rating: 4.5,
            open: true
        },
        {
            id: 2,
            name: "Apollo Pharmacy",
            address: "456 Park Avenue, Central",
            stock: "Low Stock",
            dist: "0.8 km",
            time: "12 min",
            rating: 4.7,
            open: true
        },
        {
            id: 3,
            name: "Wellness Forever",
            address: "789 Lake Road, North Side",
            stock: "Out of Stock",
            dist: "1.2 km",
            time: "18 min",
            rating: 4.3,
            open: false
        }
    ];

    // Get user's location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    setLocationError(error.message);
                    // Default to a sample location if denied
                    setUserLocation({ lat: 51.505, lng: -0.09 });
                }
            );
        } else {
            setLocationError('Geolocation not supported');
            setUserLocation({ lat: 51.505, lng: -0.09 });
        }
    }, []);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartY(e.type === 'mousedown' ? e.clientY : e.touches[0].clientY);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const deltaY = startY - currentY;
        const viewportHeight = window.innerHeight;
        const deltaPercent = (deltaY / viewportHeight) * 100;

        const newHeight = Math.min(Math.max(sheetHeight + deltaPercent, 25), 80);
        setSheetHeight(newHeight);
        setStartY(currentY);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        // Snap to positions: 25% (minimized), 50% (medium), 80% (maximized)
        if (sheetHeight < 37) {
            setSheetHeight(25);
        } else if (sheetHeight > 65) {
            setSheetHeight(80);
        } else {
            setSheetHeight(50);
        }
    };

    // Generate map URL with user location
    const getMapUrl = () => {
        if (!userLocation) return '';
        const { lat, lng } = userLocation;
        const bbox = `${lng - 0.02},${lat - 0.01},${lng + 0.02},${lat + 0.01}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    };

    if (!userLocation) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 12
            }}>
                <div style={{ fontSize: 40 }}>📍</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{t('pharmacy.gettingLocation')}</div>
                {locationError && (
                    <div style={{ fontSize: 13, color: '#718096' }}>
                        {t('pharmacy.usingDefault')}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                background: '#f7fafc',
                overflow: 'hidden',
                zIndex: 1
            }}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            {/* Map Container */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1
            }}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={getMapUrl()}
                    style={{ border: 0 }}
                    title="Map"
                />
                {/* Overlay to hide zoom controls */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 50,
                    height: 100,
                    background: 'rgba(247, 250, 252, 0.8)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 2
                }} />
            </div>

            {/* Floating Search Bar */}
            <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                zIndex: 10
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'white',
                    borderRadius: 12,
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('pharmacy.searchPlaceholder')}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: 15,
                            color: '#2d3748',
                            background: 'transparent'
                        }}
                    />
                    <button style={{
                        background: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        {t('pharmacy.search')}
                    </button>
                </div>
            </div>

            {/* Draggable Bottom Sheet - Starts Smaller */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${sheetHeight}%`,
                background: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
                zIndex: 20,
                transition: isDragging ? 'none' : 'height 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Drag Handle */}
                <div
                    style={{
                        padding: '10px 0',
                        cursor: 'grab',
                        touchAction: 'none',
                        userSelect: 'none'
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div style={{
                        width: 36,
                        height: 4,
                        background: '#cbd5e0',
                        borderRadius: 2,
                        margin: '0 auto',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }} />
                </div>

                {/* Scrollable Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 16px 80px 16px'
                }}>
                    {pharmacies.map((pharmacy) => (
                        <div
                            key={pharmacy.id}
                            onClick={() => setSelectedStore(pharmacy.id)}
                            style={{
                                background: selectedStore === pharmacy.id ? '#f0f9ff' : 'white',
                                border: selectedStore === pharmacy.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 10,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedStore === pharmacy.id ? '0 3px 10px rgba(49, 130, 206, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: 12 }}>
                                {/* Icon */}
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    background: pharmacy.stock === 'In Stock' ? '#d4f4dd' : pharmacy.stock === 'Low Stock' ? '#fef3c7' : '#fee2e2',
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    flexShrink: 0
                                }}>
                                    💊
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 3
                                    }}>
                                        <h3 style={{
                                            fontSize: 15,
                                            fontWeight: 700,
                                            margin: 0,
                                            color: '#1a202c'
                                        }}>
                                            {pharmacy.name}
                                        </h3>
                                        <span style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: '3px 7px',
                                            borderRadius: 10,
                                            background: pharmacy.stock === 'In Stock' ? '#10b981' : pharmacy.stock === 'Low Stock' ? '#f59e0b' : '#ef4444',
                                            color: 'white',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {pharmacy.stock}
                                        </span>
                                    </div>

                                    <p style={{
                                        fontSize: 12,
                                        color: '#718096',
                                        margin: '3px 0',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {pharmacy.address}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        gap: 10,
                                        marginTop: 6,
                                        fontSize: 11,
                                        color: '#4a5568'
                                    }}>
                                        <span>📍 {pharmacy.dist}</span>
                                        <span>⏱️ {pharmacy.time}</span>
                                        <span>⭐ {pharmacy.rating}</span>
                                        <span style={{
                                            color: pharmacy.open ? '#10b981' : '#ef4444',
                                            fontWeight: 600
                                        }}>
                                            {pharmacy.open ? `● ${t('pharmacy.open')}` : `● ${t('pharmacy.closed')}`}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: 7,
                                        marginTop: 10
                                    }}>
                                        <button style={{
                                            flex: 1,
                                            background: '#3182ce',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 7,
                                            padding: '7px 14px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}>
                                            {t('pharmacy.navigate')}
                                        </button>
                                        <button style={{
                                            flex: 1,
                                            background: '#f7fafc',
                                            color: '#3182ce',
                                            border: '1px solid #3182ce',
                                            borderRadius: 7,
                                            padding: '7px 14px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}>
                                            {t('pharmacy.call')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
