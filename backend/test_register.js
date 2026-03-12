
const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/identity/register', {
            username: 'test_user_script_1',
            email: 'test_script_1@example.com',
            password: 'password123'
        });
        console.log('Registration successful:', response.data);
    } catch (error) {
        console.error('Registration failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        const fs = require('fs');
        fs.writeFileSync('error_out.txt', JSON.stringify(error.response ? error.response.data : error.message, null, 2));
    }
}

testRegister();
