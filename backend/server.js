const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection
const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/safetourx';
        console.log('🔍 Checking MongoDB configuration...');

        // Try to use In-Memory MongoDB if local URI is default or missing
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost')) {
            try {
                console.log('🚀 Starting In-Memory MongoDB (this may take a few seconds)...');
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                mongoUri = mongod.getUri();
                console.log('✅ In-Memory MongoDB Started');
                console.log(`   URI: ${mongoUri}`);
            } catch (e) {
                console.error('⚠️  Failed to start in-memory MongoDB:', e.message);
                console.log('   Falling back to local connection string.');
            }
        }

        console.log(`🔌 Connecting to MongoDB...`);
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('   Please make sure MongoDB is running locally OR use a cloud URI.');
    }
};

connectDB();

// Routes
app.use('/api/identity', require('./routes/identity'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/risk', require('./routes/risk'));

app.get('/', (req, res) => {
    res.send('SafeTourX API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
