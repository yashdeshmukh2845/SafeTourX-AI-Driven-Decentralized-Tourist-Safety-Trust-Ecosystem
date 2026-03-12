const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { logIncidentOnChain } = require('../utils/algorand');
// const nodemailer = require('nodemailer'); // Optional for future

// Update Shadow Mode settings
router.post('/update', async (req, res) => {
    try {
        const { userId, isShadowModeActive, emergencyContact } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isShadowModeActive = isShadowModeActive;
        if (emergencyContact) user.emergencyContact = emergencyContact;
        if (isShadowModeActive) user.lastSafeCheck = new Date();

        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Trigger SOS from Shadow Mode
router.post('/sos', async (req, res) => {
    try {
        const { userId, location } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        console.log(`🚨 AUTO-SOS Triggered for ${user.username} at ${location}`);

        // Log to Blockchain
        let txId = "";
        try {
            txId = await logIncidentOnChain(location || "Unknown Location", "SHADOW_MODE_TIMEOUT");
        } catch (e) {
            console.error("Blockchain SOS Log Failed:", e.message);
        }

        // Mock Email Sending
        if (user.emergencyContact) {
            console.log(`📧 Sending Emergency Email to: ${user.emergencyContact}`);
            console.log(`Subject: URGENT: Shadow Mode Alert for ${user.username}`);
            console.log(`Body: User has failed to respond to safety check. Last known location: ${location}`);
        }

        res.json({ success: true, txId, msg: 'SOS Triggered and Logged' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
