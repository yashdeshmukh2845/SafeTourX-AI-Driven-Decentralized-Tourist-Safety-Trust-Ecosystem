const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database: Using Supabase (Initialized in utils/supabase.js and used in routes)
console.log('✅ App initialized. Using Supabase for database.');

// Routes
app.use('/api/identity', require('./routes/identity'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/risk', require('./routes/risk'));
// app.use('/api/shadow', require('./routes/shadow')); // Skipping for now or need refactor if it uses DB
app.use('/api/reviews', require('./routes/reviews'));

app.get('/', (req, res) => {
    res.send('SafeTourX API (Supabase) is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
