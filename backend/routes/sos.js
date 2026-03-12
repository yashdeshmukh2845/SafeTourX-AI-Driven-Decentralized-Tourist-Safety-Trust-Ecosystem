const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { logIncidentOnChain } = require('../utils/algorand');
const { sendEmergencyEmail } = require('../utils/email');

// Trigger SOS
router.post('/trigger', async (req, res) => {
    try {
        const { userId, location, userEmail } = req.body;

        let txId = "";
        try {
            txId = await logIncidentOnChain(location, "SOS");
        } catch (err) {
            console.error("Blockchain Error:", err.message);
        }

        const { data: incident, error } = await supabase
            .from('incidents')
            .insert([{
                user_id: userId, // Can be null if anonymous
                location,
                type: "SOS",
                algorand_tx_id: txId
            }])
            .select()
            .single();

        if (error) throw error;

        // Send Email Automated
        const targetEmail = userEmail || 'yashmanojdeshmukh06@gmail.com';
        sendEmergencyEmail(targetEmail, location, txId);

        // Map for frontend
        const responseIncident = {
            _id: incident.id,
            user: incident.user_id,
            location: incident.location,
            type: incident.type,
            algorandTxId: incident.algorand_tx_id,
            createdAt: incident.created_at
        };

        res.status(201).json({
            success: true,
            msg: 'SOS Triggered & Email Sent',
            txId: responseIncident.algorandTxId,
            explorerUrl: responseIncident.algorandTxId ? `https://testnet.algoexplorer.io/tx/${responseIncident.algorandTxId}` : null,
            incident: responseIncident
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Incidents (Authority Dashboard)
router.get('/', async (req, res) => {
    try {
        const { data: incidents, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedIncidents = incidents.map(inc => ({
            _id: inc.id,
            user: inc.user_id,
            location: inc.location,
            type: inc.type,
            riskScore: inc.risk_score,
            algorandTxId: inc.algorand_tx_id,
            createdAt: inc.created_at
        }));

        res.json(mappedIncidents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
