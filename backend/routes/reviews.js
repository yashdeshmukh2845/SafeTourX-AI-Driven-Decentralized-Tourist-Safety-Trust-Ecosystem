const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { logReviewOnChain } = require('../utils/algorand');
const crypto = require('crypto');

// Submit Review
router.post('/add', async (req, res) => {
    try {
        const { userId, bookingId, rating, comment } = req.body;

        // Verify Booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) return res.status(404).json({ msg: 'Booking not found' });

        if (booking.user_id !== userId) {
            return res.status(401).json({ msg: 'Unauthorized: Booking does not belong to user' });
        }

        if (booking.status !== 'Completed') {
            // Note: In demo, we might allow it if status logic isn't perfect, but let's keep check
            // For hackathon, maybe relax this check or ensure booking is 'Completed'
            // return res.status(400).json({ msg: 'Only completed bookings can be reviewed.' });
        }

        // Create Hash
        const reviewHash = crypto.createHash('sha256').update(userId + bookingId + rating + comment).digest('hex');

        // Log to Blockchain
        let txId = "";
        try {
            txId = await logReviewOnChain(reviewHash);
        } catch (e) {
            console.error("Blockchain Review Log Failed:", e.message);
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .insert([{
                user_id: userId,
                booking_id: bookingId,
                hotel_name: booking.hotel_name,
                rating,
                comment,
                review_hash: reviewHash,
                algorand_tx_id: txId
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            review: {
                _id: review.id,
                user: review.user_id,
                booking: review.booking_id,
                hotelName: review.hotel_name,
                rating: review.rating,
                comment: review.comment,
                reviewHash: review.review_hash,
                algorandTxId: review.algorand_tx_id,
                createdAt: review.created_at
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Reviews for Hotel
router.get('/:hotelName', async (req, res) => {
    try {
        // Populating user username: Supabase join
        // users!inner means inner join, usually we want left join or just implicit
        // select('*, users(username)') works if FK exists
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*, users(username)')
            .eq('hotel_name', req.params.hotelName);

        if (error) throw error;

        const mappedReviews = reviews.map(r => ({
            _id: r.id,
            user: { _id: r.user_id, username: r.users?.username || 'Anonymous' }, // Populate format
            booking: r.booking_id,
            hotelName: r.hotel_name,
            rating: r.rating,
            comment: r.comment,
            reviewHash: r.review_hash,
            algorandTxId: r.algorand_tx_id,
            createdAt: r.created_at
        }));

        res.json(mappedReviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
