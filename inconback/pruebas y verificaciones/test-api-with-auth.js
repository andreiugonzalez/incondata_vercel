require('dotenv').config();
const axios = require('axios');

async function testContratistaWithAuth() {
    try {
        console.log('Testing /user/users endpoint with authentication...');
        
        // First, let's try to login as superadmin2
        const loginResponse = await axios.post('http://localhost:3111/login', {
            email: 'superadmin2@sistema.com',
            password: 'super1234'
        });
        
        console.log('Login status:', loginResponse.status);
        console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2));
        
        const token = loginResponse.data.data.token;
        console.log('Token received:', token ? 'Yes' : 'No');
        
        if (!token) {
            console.error('❌ No token received from login');
            return;
        }
        
        // Now test the contractor endpoint with the token
        const response = await axios.get('http://localhost:3111/user/users', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Contractor endpoint status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.length > 0) {
            console.log(`✅ Found ${response.data.length} contractor(s) with authentication`);
        } else {
            console.log('❌ No contractors found in authenticated response');
        }
        
    } catch (error) {
        console.error('❌ Error testing endpoint with auth:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testContratistaWithAuth();