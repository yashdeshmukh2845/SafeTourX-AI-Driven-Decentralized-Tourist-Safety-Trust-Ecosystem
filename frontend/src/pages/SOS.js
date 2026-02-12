import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { triggerSOS } from '../services/api';
import { toast } from 'react-toastify';

const SOS = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);

    const handleSOS = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
                setLocation(loc);

                try {
                    const response = await triggerSOS({
                        userId: user._id,
                        location: `${loc.lat},${loc.lon}`,
                        type: 'Emergency',
                        riskScore: 100,
                    });

                    toast.success('🚨 SOS Alert Sent! Authorities notified.');

                    if (response.txId) {
                        toast.info(`Blockchain TX: ${response.txId.substring(0, 20)}...`, {
                            autoClose: 5000,
                        });
                    }

                    setTimeout(() => navigate('/dashboard'), 3000);
                } catch (error) {
                    toast.error(error.response?.data?.msg || 'SOS failed');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error('Failed to get location');
                setLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-blue-400 hover:text-blue-300 mb-4"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Emergency SOS</h1>
                    <p className="text-gray-400">
                        Press the button below to send an emergency alert
                    </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <div className="mb-8">
                        <div className="w-48 h-48 mx-auto bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 transition-shadow cursor-pointer active:scale-95 transform"
                            onClick={handleSOS}
                            style={{ userSelect: 'none' }}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <div>
                                    <div className="text-6xl mb-2">🚨</div>
                                    <div className="text-2xl font-bold">SOS</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">What happens when you press SOS?</h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Your location is captured and sent to authorities</li>
                                <li>• Incident is logged on Algorand blockchain</li>
                                <li>• Emergency contacts are notified</li>
                                <li>• Your incident appears on the admin dashboard</li>
                            </ul>
                        </div>

                        {location && (
                            <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Current Location</h3>
                                <p className="text-sm text-gray-300">
                                    Lat: {location.lat.toFixed(6)}, Lon: {location.lon.toFixed(6)}
                                </p>
                            </div>
                        )}

                        <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span> Important
                            </h3>
                            <p className="text-sm text-gray-300">
                                Only use this feature in genuine emergencies. False alarms may result in
                                penalties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SOS;
