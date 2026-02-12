const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
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

        const booking = new Booking({
            user: userId,
            hotelName,
            checkIn,
            checkOut,
            bookingHash,
            algorandTxId: txId
        });

        await booking.save();
        res.status(201).json(booking);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Bookings
router.get('/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
