const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get Risk Prediction
// Input: { lat, lon, time }
// Output: Risk Level
router.post('/risk', async (req, res) => {
    try {
        const { lat, lon } = req.body;

        // Mocking 'crime_rate' for now based on location or random, OR passing it if known.
        // For MVP, we'll let the AI model decide based on lat/lon/time.
        // The AI Service expects { crime_rate, hour, lat, lon }.

        // Simulating data enrichment:
        const currentHour = new Date().getHours();
        const dummyCrimeRate = Math.floor(Math.random() * 100); // In real app, query crime DB

        const aiResponse = await axios.post('http://localhost:5001/predict', {
            crime_rate: dummyCrimeRate,
            hour: currentHour,
            lat: lat || 0.5,
            lon: lon || 0.5
        });

        res.json(aiResponse.data);

    } catch (err) {
        console.error("AI Service Error:", err.message);
        res.status(500).json({ msg: 'AI Service Unavailable' });
    }
});

module.exports = router;
