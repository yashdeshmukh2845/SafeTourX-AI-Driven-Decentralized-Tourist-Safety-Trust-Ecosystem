import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { createBooking, getUserBookings, updateBookingStatus, submitReview } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const hotels = [
    { id: 1, name: "Taj Mahal Palace", location: "Mumbai", price: 250, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000", rating: 4.8 },
    { id: 2, name: "Oberoi Udaivilas", location: "Udaipur", price: 400, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000", rating: 4.9 },
    { id: 3, name: "Goa Beach Resort", location: "Goa", price: 150, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000", rating: 4.5 },
];

const Booking = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(hotels[0]);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Review Modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewBookingId, setReviewBookingId] = useState(null);


    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        if (user?._id) {
            try {
                const data = await getUserBookings(user._id);
                setBookings(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            toast.error("Please select a payment method.");
            return;
        }

        setIsProcessing(true);
        try {
            await createBooking({
                userId: user._id,
                hotelName: selectedHotel.name,
                checkIn,
                checkOut
            });
            toast.success("Booking Confirmed! Blockchain Record Created.");
            loadBookings();

            // Reset form
            setCheckIn('');
            setCheckOut('');
            setPaymentMethod('');

        } catch (error) {
            toast.error("Booking Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        if (status === 'Refunded' && !window.confirm("Are you sure you want to cancel and request a refund? This will trigger a smart contract refund.")) return;

        try {
            await updateBookingStatus(id, status);
            toast.info(`Booking status updated to ${status}`);
            loadBookings();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const openReviewModal = (bookingId) => {
        setReviewBookingId(bookingId);
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async () => {
        if (!reviewText) return toast.error("Please write a review");

        try {
            await submitReview({
                bookingId: reviewBookingId,
                rating: reviewRating,
                comment: reviewText
            });
            toast.success("Review Verified & Logged on Blockchain!");
            setShowReviewModal(false);
            setReviewText("");
        } catch (error) {
            toast.error("Review submission failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-8">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Hotel Booking</h1>
                    <p className="text-gray-500 dark:text-gray-400">Secure, Blockchain-Verified Stays</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hotel Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Select a Hotel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hotels.map(hotel => (
                            <div
                                key={hotel.id}
                                onClick={() => setSelectedHotel(hotel)}
                                className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all shadow-sm hover:shadow-md ${selectedHotel.id === hotel.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent bg-white dark:bg-gray-800'}`}
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                        ⭐ {hotel.rating}
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{hotel.name}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">📍 {hotel.location}</p>
                                        </div>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold">${hotel.price}<span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/night</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl h-fit sticky top-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>📅</span> Book Your Stay
                    </h2>

                    <form onSubmit={handleBooking} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected Hotel</label>
                            <input
                                type="text"
                                value={selectedHotel.name}
                                disabled
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-semibold text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-In</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white color-scheme-dark"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-Out</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Credit Card', 'UPI', 'Crypto'].map((method) => (
                                    <div
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`cursor-pointer text-center p-3 rounded-xl border transition-all ${paymentMethod === method ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <div className="text-xl mb-1">
                                            {method === 'Credit Card' ? '💳' : method === 'UPI' ? '📱' : '₿'}
                                        </div>
                                        <div className="text-xs">{method}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                            <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Blockchain Fee</span>
                                <span>0.001 ALGO</span>
                            </div>
                            <div className="flex justify-between items-center mb-6 text-lg font-bold">
                                <span>Total</span>
                                <span>${selectedHotel.price}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105'}`}
                            >
                                {isProcessing ? 'Processing Transaction...' : 'Confirm Booking'}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <span>🔒</span> Secured by Algorand Blockchain
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bookings List */}
            <div className="mt-16 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.hotelName}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                booking.status === 'Refunded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-gray-100 text-gray-600'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg w-fit">
                                    <span>TXID:</span>
                                    <a href={`https://testnet.algoexplorer.io/tx/${booking.algorandTxId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px]">
                                        {booking.algorandTxId || 'Pending...'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {booking.status === 'Confirmed' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(booking._id, 'Refunded')}
                                            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Request Refund
                                        </button>
                                        <button
                                            onClick={() => openReviewModal(booking._id)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
                                        >
                                            Write Review
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {bookings.length === 0 && (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border dark:border-gray-700">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Write a Review ✍️</h3>

                        <div className="flex gap-2 mb-6 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className={`text-3xl transition-transform hover:scale-125 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 mb-6 min-h-[120px]"
                            placeholder="Share your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Booking;
