const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get Risk Prediction (Single Point)
// Route: /api/risk/risk (or just /api/risk if we fix the mount)
// Current: server.js mounts at /api/risk. This adds /risk. -> /api/risk/risk.
// To support /api/risk (cleaner), we should add '/' handler.
// But let's keep existing to avoid breaking changes if frontend uses /risk/risk?
// Wait, frontend uses /risk. 
// If server mounts at /api/risk, request to /api/risk needs '/' in router.
// If existing code works, maybe server mounts at /api? No, viewed server.js.
// I will add '/' handler just in case.

router.post('/', async (req, res) => {
    handleRiskRequest(req, res);
});

router.post('/risk', async (req, res) => {
    handleRiskRequest(req, res);
});

async function handleRiskRequest(req, res) {
    try {
        const { lat, lon } = req.body;
        // AI Service expects { crime_rate, hour, lat, lon }
        const currentHour = new Date().getHours();

        // Use updated AI endpoint /predict which only needs lat/lon/hour
        const aiResponse = await axios.post('http://localhost:5001/predict', {
            hour: currentHour,
            lat: lat || 0.5,
            lon: lon || 0.5
        });

        res.json(aiResponse.data);

    } catch (err) {
        console.error("AI Service Error:", err.message);
        res.status(500).json({ msg: 'AI Service Unavailable' });
    }
}

// Batch Risk Prediction (For Routing)
// Route: /api/risk/batch
router.post('/batch', async (req, res) => {
    try {
        const { points } = req.body; // Expects array of {lat, lon}

        const aiResponse = await axios.post('http://localhost:5001/predict_batch', {
            points: points
        });

        res.json(aiResponse.data);

    } catch (err) {
        console.error("AI Batch Service Error:", err.message);
        res.status(500).json({ msg: 'AI Service Unavailable' });
    }
});

module.exports = router;
