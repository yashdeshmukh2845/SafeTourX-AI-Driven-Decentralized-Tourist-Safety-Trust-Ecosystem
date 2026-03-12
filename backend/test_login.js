
const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/identity/login', {
            email: 'test_script_1@example.com',
            password: 'password123'
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.error('Login failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        const fs = require('fs');
        fs.writeFileSync('login_error.txt', JSON.stringify(error.response ? error.response.data : error.message, null, 2));
    }
}

testLogin();
