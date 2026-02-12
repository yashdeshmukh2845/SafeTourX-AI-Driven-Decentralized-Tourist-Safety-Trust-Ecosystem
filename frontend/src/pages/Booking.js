import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { createBooking } from '../services/api';
import { toast } from 'react-toastify';

const Booking = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        hotelName: '',
        checkIn: '',
        checkOut: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createBooking({
                ...formData,
                userId: user._id,
            });

            toast.success('Booking secured on Algorand blockchain!');

            if (response.txId) {
                toast.info(`Blockchain TX: ${response.txId.substring(0, 20)}...`, {
                    autoClose: 5000,
                });
            }

            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Hotel Booking</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-lg p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Secure Your Stay</h2>
                        <p className="text-gray-400">
                            All bookings are verified and secured on the Algorand blockchain
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Hotel Name
                            </label>
                            <input
                                type="text"
                                name="hotelName"
                                value={formData.hotelName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter hotel name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Check-in Date
                                </label>
                                <input
                                    type="date"
                                    name="checkIn"
                                    value={formData.checkIn}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Check-out Date
                                </label>
                                <input
                                    type="date"
                                    name="checkOut"
                                    value={formData.checkOut}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <span>🔒</span> Blockchain Verification
                            </h3>
                            <p className="text-sm text-gray-300">
                                Your booking will be cryptographically secured and permanently recorded on
                                the Algorand blockchain, ensuring transparency and immutability.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Confirm Booking & Verify on Blockchain'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Booking;
