import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { getUserBookings, getAllIncidents, getRiskPrediction } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const Dashboard = () => {
    const { user, logout } = useUser();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [currentRisk, setCurrentRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    // Shadow Mode State
    const [isShadowMode, setIsShadowMode] = useState(false);
    const [emergencyContact, setEmergencyContact] = useState('');
    const [showShadowModal, setShowShadowModal] = useState(false);

    // QR Code Modal
    const [showQRModal, setShowQRModal] = useState(false);

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
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full text-sm font-bold',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-3 py-1 rounded-full text-sm font-bold',
            High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-sm font-bold',
        };
        return classes[level] || 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Polling for High Risk in Shadow Mode
    useEffect(() => {
        let interval;
        if (isShadowMode) {
            interval = setInterval(() => {
                console.log("Shadow Mode Active: Monitoring Risk Level...");
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [isShadowMode]);

    const toggleShadowMode = async () => {
        if (!isShadowMode) {
            setShowShadowModal(true);
        } else {
            setIsShadowMode(false);
            try {
                await axios.post('http://localhost:5000/api/shadow/update', {
                    userId: user._id,
                    isShadowModeActive: false
                });
                toast.info("Shadow Mode Deactivated");
            } catch (error) {
                console.error("Failed to update shadow mode", error);
            }
        }
    };

    const activateShadowMode = async () => {
        if (!emergencyContact) {
            toast.error("Please enter an emergency contact email.");
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/shadow/update', {
                userId: user._id,
                isShadowModeActive: true,
                emergencyContact
            });
            setIsShadowMode(true);
            setShowShadowModal(false);
            toast.success("Shadow Mode Activated! We are monitoring your safety.");
        } catch (error) {
            toast.error("Failed to activate Shadow Mode");
        }
    };

    const fetchRiskScore = () => {
        getCurrentLocationRisk();
        toast.info("Refreshing risk score...");
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex transition-colors duration-300">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">
                        SafeTourX
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tourist Safety Ecosystem</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <button className="w-full flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-500/30">
                        <span className="font-semibold">Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/booking')} className="w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
                        <span className="font-medium">Hotel Bookings</span>
                    </button>
                    <button onClick={() => navigate('/sos')} className="w-full flex items-center px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-colors">
                        <span className="font-bold">SOS Emergency</span>
                    </button>
                    <button onClick={() => navigate('/admin')} className="w-full flex items-center px-4 py-3 text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-xl transition-colors">
                        <span className="font-bold">Admin Panel</span>
                    </button>
                </nav>

                {/* Shadow Mode Toggle in Sidebar */}
                <div className="p-6 mt-10">
                    <div className={`p-4 rounded-xl border ${isShadowMode ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/50' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'} transition-colors duration-300`}>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Shadow Mode</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            {isShadowMode ? "Active: Monitoring your safety." : "Disabled: Enable for auto-safety checks."}
                        </p>
                        <button
                            onClick={toggleShadowMode}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition ${isShadowMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg`}
                        >
                            {isShadowMode ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">{user?.username || 'Traveler'}</span>!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Current Location: <span className="font-semibold text-blue-600 dark:text-blue-400">Mumbai, India</span> (Simulated)
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        <button
                            onClick={fetchRiskScore}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl transition-colors text-sm font-semibold shadow-sm"
                        >
                            Refresh Risk
                        </button>

                        {/* Identity QR Button */}
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-[2px] rounded-full cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowQRModal(true)}>
                            <div className="bg-white dark:bg-gray-900 p-2 rounded-full">
                                <span className="font-bold text-gray-800 dark:text-white w-8 h-8 flex items-center justify-center">{user?.username?.[0] || 'U'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-white border border-red-200 dark:border-red-600/30 px-4 py-2 rounded-xl transition-all font-semibold text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Shadow Mode Modal */}
                {showShadowModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Activate Shadow Mode 🕵️‍♂️</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                We will monitor your location and automatically trigger an SOS if you don't respond to safety checks in high-risk zones.
                            </p>
                            <label className="block text-sm font-bold text-blue-600 dark:text-blue-300 mb-2">Emergency Contact Email</label>
                            <input
                                type="email"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6"
                                placeholder="parent@example.com"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setShowShadowModal(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-bold transition-colors">Cancel</button>
                                <button onClick={activateShadowMode} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-colors">Activate</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code Modal */}
                {showQRModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Digital Identity</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Scan to verify blockchain identity</p>

                            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-6">
                                <QRCodeCanvas
                                    value={JSON.stringify({
                                        id: user?._id,
                                        hash: user?.identityHash || 'mock-hash',
                                        name: user?.username
                                    })}
                                    size={200}
                                    level={"H"}
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                                <p className="text-xs text-blue-800 dark:text-blue-300 font-mono break-all">
                                    Hash: {user?.identityHash || 'Waiting for blockchain sync...'}
                                </p>
                            </div>

                            <button onClick={() => setShowQRModal(false)} className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-colors">Close</button>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => navigate('/map')}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 p-6 rounded-2xl transition-all group text-left shadow-sm hover:shadow-md"
                    >
                        <div className="bg-blue-100 dark:bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">📍</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Map View</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track your location</p>
                    </button>

                    <button
                        onClick={() => navigate('/booking')}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group text-left shadow-sm hover:shadow-md"
                    >
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">🏨</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Book Hotel</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Secure booking</p>
                    </button>

                    <button
                        onClick={() => navigate('/sos')}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-500/50 p-6 rounded-2xl transition-all group text-left shadow-sm hover:shadow-md"
                    >
                        <div className="bg-red-100 dark:bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">🚨</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">SOS</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Emergency alert</p>
                    </button>

                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 p-6 rounded-2xl transition-all group text-left shadow-sm hover:shadow-md"
                    >
                        <div className="bg-purple-100 dark:bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">👮</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Admin</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View incidents</p>
                    </button>
                </div>

                {/* Current Risk Level */}
                {currentRisk && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Location Risk</h2>
                        <div className="flex items-center gap-4">
                            <span className={getRiskBadgeClass(currentRisk.risk_level)}>
                                {currentRisk.risk_level} Risk
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                Risk Score: <span className="text-gray-900 dark:text-white font-mono font-bold">{currentRisk.risk_score}</span>
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Bookings */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                            <button className="text-sm text-blue-500 hover:text-blue-400">View All</button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="spinner"></div>
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.slice(0, 5).map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{booking.hotelName}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                                                {new Date(booking.checkOut).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-1">
                                                <span>Verified</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-600 font-mono">
                                                {booking.txId?.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No bookings yet</p>
                            </div>
                        )}
                    </div>

                    {/* SOS History */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">SOS History</h2>
                            <button className="text-sm text-blue-500 hover:text-blue-400">View All</button>
                        </div>

                        {incidents.length > 0 ? (
                            <div className="space-y-4">
                                {incidents.slice(0, 5).map((incident) => (
                                    <div
                                        key={incident._id}
                                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-red-500 dark:text-red-400 flex items-center gap-2">
                                                {incident.type}
                                                <span className="text-xs bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-500/20">Alert</span>
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(incident.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 dark:text-gray-600 font-mono block">
                                                TX: {incident.txId?.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No SOS incidents recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
