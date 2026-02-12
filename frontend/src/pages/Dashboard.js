import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getUserBookings, getAllIncidents, getRiskPrediction } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [currentRisk, setCurrentRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        getCurrentLocationRisk();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingsData, incidentsData] = await Promise.all([
                getUserBookings(user._id),
                getAllIncidents(),
            ]);
            setBookings(bookingsData);
            setIncidents(incidentsData.filter(inc => inc.userId === user._id));
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocationRisk = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const risk = await getRiskPrediction({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                        });
                        setCurrentRisk(risk);
                    } catch (error) {
                        console.error('Risk prediction failed:', error);
                    }
                },
                (error) => console.error('Geolocation error:', error)
            );
        }
    };

    const getRiskBadgeClass = (level) => {
        const classes = {
            Low: 'risk-badge risk-low',
            Medium: 'risk-badge risk-medium',
            High: 'risk-badge risk-high',
        };
        return classes[level] || 'risk-badge';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">SafeTourX Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">Welcome, {user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/map')}
                        className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition-colors"
                    >
                        <h3 className="text-xl font-semibold mb-2">📍 Map View</h3>
                        <p className="text-sm text-gray-300">Track your location</p>
                    </button>
                    <button
                        onClick={() => navigate('/booking')}
                        className="bg-green-600 hover:bg-green-700 p-6 rounded-lg transition-colors"
                    >
                        <h3 className="text-xl font-semibold mb-2">🏨 Book Hotel</h3>
                        <p className="text-sm text-gray-300">Secure booking</p>
                    </button>
                    <button
                        onClick={() => navigate('/sos')}
                        className="bg-red-600 hover:bg-red-700 p-6 rounded-lg transition-colors"
                    >
                        <h3 className="text-xl font-semibold mb-2">🚨 SOS</h3>
                        <p className="text-sm text-gray-300">Emergency alert</p>
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-purple-600 hover:bg-purple-700 p-6 rounded-lg transition-colors"
                    >
                        <h3 className="text-xl font-semibold mb-2">👮 Admin</h3>
                        <p className="text-sm text-gray-300">View incidents</p>
                    </button>
                </div>

                {/* Current Risk Level */}
                {currentRisk && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Current Location Risk</h2>
                        <div className="flex items-center gap-4">
                            <span className={getRiskBadgeClass(currentRisk.risk_level)}>
                                {currentRisk.risk_level} Risk
                            </span>
                            <span className="text-gray-400">
                                Risk Score: {currentRisk.risk_score}
                            </span>
                        </div>
                    </div>
                )}

                {/* Recent Bookings */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="spinner"></div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map((booking) => (
                                <div
                                    key={booking._id}
                                    className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold">{booking.hotelName}</h3>
                                        <p className="text-sm text-gray-400">
                                            {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                                            {new Date(booking.checkOut).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-green-400 text-sm">✓ Verified on Algorand</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            TX: {booking.txId?.substring(0, 10)}...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No bookings yet</p>
                    )}
                </div>

                {/* SOS History */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">SOS History</h2>
                    {incidents.length > 0 ? (
                        <div className="space-y-4">
                            {incidents.slice(0, 5).map((incident) => (
                                <div
                                    key={incident._id}
                                    className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold text-red-400">{incident.type}</h3>
                                        <p className="text-sm text-gray-400">
                                            {new Date(incident.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500">
                                            TX: {incident.txId?.substring(0, 10)}...
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No SOS incidents</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
