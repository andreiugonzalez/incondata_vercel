require('dotenv').config();
const axios = require('axios');

async function testContratistaEndpoint() {
    try {
        console.log('Testing /user/users/contratista endpoint...');
        
        // Test the endpoint directly (matching frontend call)
        const response = await axios.get('http://localhost:3111/user/users', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.length > 0) {
            console.log(`✅ Found ${response.data.length} contractor(s)`);
        } else {
            console.log('❌ No contractors found in response');
        }
        
    } catch (error) {
        console.error('❌ Error testing endpoint:', error.message);
        console.error('Full error:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

testContratistaEndpoint();