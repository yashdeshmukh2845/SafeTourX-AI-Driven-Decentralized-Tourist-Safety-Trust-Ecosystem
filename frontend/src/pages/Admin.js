import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIncidents, getUserBookings } from '../services/api';
import { toast } from 'react-toastify';

const Admin = () => {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incidents');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [incidentsData, bookingsData] = await Promise.all([
                getAllIncidents(),
                // For admin, we'd need an endpoint to get all bookings
                // For now, using empty array
                Promise.resolve([]),
            ]);
            setIncidents(incidentsData);
            setBookings(bookingsData);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const highRiskIncidents = incidents.filter((inc) => inc.riskScore >= 70);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">👮 Authority Dashboard</h1>
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
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
                        <h3 className="text-sm text-gray-400 mb-2">High Risk Alerts</h3>
                        <p className="text-4xl font-bold">{highRiskIncidents.length}</p>
                    </div>
                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Total Incidents</h3>
                        <p className="text-4xl font-bold">{incidents.length}</p>
                    </div>
                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Total Bookings</h3>
                        <p className="text-4xl font-bold">{bookings.length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('incidents')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'incidents'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            All Incidents
                        </button>
                        <button
                            onClick={() => setActiveTab('high-risk')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'high-risk'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            High Risk Alerts
                        </button>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(activeTab === 'incidents' ? incidents : highRiskIncidents).length >
                                    0 ? (
                                    (activeTab === 'incidents' ? incidents : highRiskIncidents).map(
                                        (incident) => (
                                            <div
                                                key={incident._id}
                                                className="bg-gray-700 rounded-lg p-4 border-l-4"
                                                style={{
                                                    borderLeftColor:
                                                        incident.riskScore >= 70
                                                            ? '#ef4444'
                                                            : incident.riskScore >= 40
                                                                ? '#eab308'
                                                                : '#10b981',
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {incident.type || 'Emergency'}
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            {new Date(incident.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-sm font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                incident.riskScore >= 70
                                                                    ? '#ef4444'
                                                                    : incident.riskScore >= 40
                                                                        ? '#eab308'
                                                                        : '#10b981',
                                                            color: incident.riskScore >= 40 ? '#000' : '#fff',
                                                        }}
                                                    >
                                                        Risk: {incident.riskScore}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">Location:</span>
                                                        <p className="font-mono">{incident.location}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Blockchain TX:</span>
                                                        <p className="font-mono text-blue-400">
                                                            {incident.txId?.substring(0, 20)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        No incidents to display
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gray-800 rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">High-Risk Zones Map</h2>
                    <div className="bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                        <p className="text-gray-400">
                            Map visualization of high-risk zones would appear here
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
