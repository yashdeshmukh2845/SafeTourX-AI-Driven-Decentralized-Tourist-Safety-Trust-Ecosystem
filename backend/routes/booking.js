const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { logBookingOnChain } = require('../utils/algorand');
const crypto = require('crypto');

// Create Booking
router.post('/create', async (req, res) => {
    try {
        const { userId, hotelName, checkIn, checkOut } = req.body;

        const bookingHash = crypto.createHash('sha256').update(userId + hotelName + checkIn).digest('hex');

        let txId = "";
        try {
            txId = await logBookingOnChain(bookingHash);
        } catch (err) {
            console.error("Blockchain Error:", err.message);
        }

        const { data: booking, error } = await supabase
            .from('bookings')
            .insert([{
                user_id: userId,
                hotel_name: hotelName,
                check_in: checkIn,
                check_out: checkOut,
                booking_hash: bookingHash,
                algorand_tx_id: txId,
                status: 'Pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // Map back to camelCase for frontend
        const responseBooking = {
            _id: booking.id,
            user: booking.user_id,
            hotelName: booking.hotel_name,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            bookingHash: booking.booking_hash,
            algorandTxId: booking.algorand_tx_id,
            status: booking.status,
            createdAt: booking.created_at
        };

        res.status(201).json({
            success: true,
            txId: responseBooking.algorandTxId,
            explorerUrl: responseBooking.algorandTxId ? `https://testnet.algoexplorer.io/tx/${responseBooking.algorandTxId}` : null,
            booking: responseBooking
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Booking Status (Smart Escrow Simulation)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        // Fetch current booking
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) return res.status(404).json({ msg: 'Booking not found' });

        let escrowTxId = booking.escrow_tx_id;

        // If Refunded, Log to Blockchain
        if (status === 'Refunded' || status === 'Cancelled') {
            try {
                const bookingHash = booking.booking_hash || "mock-hash";
                escrowTxId = await logBookingOnChain(bookingHash);
            } catch (e) {
                console.error("Blockchain Refund Log Failed:", e.message);
            }
        }

        // Update Status
        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({ status: status, escrow_tx_id: escrowTxId })
            .eq('id', bookingId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            _id: updatedBooking.id,
            status: updatedBooking.status,
            escrowTxId: updatedBooking.escrow_tx_id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Bookings
router.get('/:userId', async (req, res) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', req.params.userId);

        if (error) throw error;

        // Map to camelCase
        const mappedBookings = bookings.map(b => ({
            _id: b.id,
            user: b.user_id,
            hotelName: b.hotel_name,
            checkIn: b.check_in,
            checkOut: b.check_out,
            bookingHash: b.booking_hash,
            algorandTxId: b.algorand_tx_id,
            escrowTxId: b.escrow_tx_id,
            status: b.status,
            createdAt: b.created_at
        }));

        res.json(mappedBookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
