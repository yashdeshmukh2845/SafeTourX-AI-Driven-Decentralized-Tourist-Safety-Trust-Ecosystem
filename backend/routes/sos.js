const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { logIncidentOnChain } = require('../utils/algorand');

// Trigger SOS
router.post('/trigger', async (req, res) => {
    try {
        const { userId, location } = req.body; // userId optional

        let txId = "";
        try {
            txId = await logIncidentOnChain(location, "SOS");
        } catch (err) {
            console.error("Blockchain Error:", err.message);
        }

        const incident = new Incident({
            user: userId,
            location,
            type: "SOS",
            algorandTxId: txId
        });

        await incident.save();
        res.status(201).json({
            success: true,
            msg: 'SOS Triggered',
            txId: incident.algorandTxId,
            explorerUrl: incident.algorandTxId ? `https://testnet.algoexplorer.io/tx/${incident.algorandTxId}` : null,
            incident
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Incidents (Authority Dashboard)
router.get('/', async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ createdAt: -1 });
        res.json(incidents);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
