
const axios = require('axios');

async function testRisk() {
    try {
        // Test /api/risk/
        console.log("Testing /api/risk/...");
        const response1 = await axios.post('http://localhost:5000/api/risk', {
            lat: 19.0760,
            lon: 72.8777
        });
        console.log('Risk Check 1 (Root) successful. Keys:', Object.keys(response1.data));
        console.log('Full Data:', response1.data);

        // Test /api/risk/risk
        console.log("\nTesting /api/risk/risk...");
        const response2 = await axios.post('http://localhost:5000/api/risk/risk', {
            lat: 19.0760,
            lon: 72.8777
        });
        const fs = require('fs');
        fs.writeFileSync('risk_out.txt', JSON.stringify(response1.data, null, 2));
    } catch (error) {
        console.error('Risk Check failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        const fs = require('fs');
        fs.writeFileSync('risk_error.txt', JSON.stringify(error.response ? error.response.data : error.message, null, 2));
    }
}

testRisk();
