import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { getRiskPrediction } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
    width: '100%',
    height: '600px',
};

const MapView = () => {
    const navigate = useNavigate();
    const [map, setMap] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [tracking, setTracking] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY',
    });

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const checkRisk = async (lat, lon) => {
        try {
            const risk = await getRiskPrediction({ lat, lon });
            setRiskData(risk);

            if (risk.risk_level === 'High') {
                toast.warning('⚠️ High Risk Area! Consider moving to a safer location.', {
                    autoClose: 10000,
                });
            }
        } catch (error) {
            console.error('Risk check failed:', error);
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setTracking(true);

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setCurrentPosition(pos);
                checkRisk(pos.lat, pos.lng);

                if (map) {
                    map.panTo(pos);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error('Failed to get location');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000,
            }
        );

        // Check risk every 10 seconds
        const intervalId = setInterval(() => {
            if (currentPosition) {
                checkRisk(currentPosition.lat, currentPosition.lng);
            }
        }, 10000);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            clearInterval(intervalId);
        };
    };

    useEffect(() => {
        // Get initial position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentPosition(pos);
                    checkRisk(pos.lat, pos.lng);
                },
                (error) => console.error('Geolocation error:', error)
            );
        }
    }, []);

    const getRiskColor = (level) => {
        const colors = {
            Low: '#10b981',
            Medium: '#eab308',
            High: '#ef4444',
        };
        return colors[level] || '#6b7280';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Live Map & Geo-Fencing</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Risk Status */}
                {riskData && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Current Risk Level</h2>
                                <span
                                    className="risk-badge"
                                    style={{
                                        backgroundColor: getRiskColor(riskData.risk_level),
                                        color: riskData.risk_level === 'Medium' ? '#000' : '#fff',
                                    }}
                                >
                                    {riskData.risk_level} Risk
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Risk Score</p>
                                <p className="text-3xl font-bold">{riskData.risk_score}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracking Controls */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">
                            {tracking ? '🟢 Live tracking active' : '⚪ Tracking inactive'}
                        </p>
                    </div>
                    <button
                        onClick={startTracking}
                        disabled={tracking}
                        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {tracking ? 'Tracking...' : 'Start Live Tracking'}
                    </button>
                </div>

                {/* Map */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    {isLoaded && currentPosition ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={currentPosition}
                            zoom={15}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{
                                styles: [
                                    {
                                        elementType: 'geometry',
                                        stylers: [{ color: '#242f3e' }],
                                    },
                                    {
                                        elementType: 'labels.text.stroke',
                                        stylers: [{ color: '#242f3e' }],
                                    },
                                    {
                                        elementType: 'labels.text.fill',
                                        stylers: [{ color: '#746855' }],
                                    },
                                ],
                            }}
                        >
                            {/* Risk Zone Circle */}
                            {riskData && (
                                <Circle
                                    center={currentPosition}
                                    radius={500}
                                    options={{
                                        fillColor: getRiskColor(riskData.risk_level),
                                        fillOpacity: 0.2,
                                        strokeColor: getRiskColor(riskData.risk_level),
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="h-96 flex items-center justify-center">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-3">How it works</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li>• Click "Start Live Tracking" to enable continuous location monitoring</li>
                        <li>• Risk level is updated every 10 seconds based on your location</li>
                        <li>• Green zone = Low risk, Yellow = Medium risk, Red = High risk</li>
                        <li>• You'll receive alerts if you enter a high-risk area</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default MapView;
