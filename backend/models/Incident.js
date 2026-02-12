const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if anonymous
    location: { type: String, required: true },
    type: { type: String, default: 'SOS' },
    riskScore: { type: String }, // From AI
    algorandTxId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);
