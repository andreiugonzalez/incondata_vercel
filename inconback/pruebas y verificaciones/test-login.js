const { default: fetch } = require('node-fetch');

async function testLogin() {
    const loginData = {
        email: 'superadmin@sistema.com',
        password: 'SuperAdmin2024!'
    };

    console.log('Testing login with:');
    console.log('Email:', JSON.stringify(loginData.email));
    console.log('Email length:', loginData.email.length);
    console.log('Password:', JSON.stringify(loginData.password));
    
    // Verificar si hay caracteres especiales ocultos
    for (let i = 0; i < loginData.email.length; i++) {
        const char = loginData.email[i];
        const code = char.charCodeAt(0);
        if (code < 32 || code > 126) {
            console.log(`Caracter especial encontrado en posición ${i}: ${code}`);
        }
    }

    try {
        const response = await fetch('http://localhost:3111/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        console.log('\nResponse status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.text();
        console.log('Response body (raw):', responseData);

        try {
            const jsonData = JSON.parse(responseData);
            console.log('Response body (parsed):', jsonData);
        } catch (parseError) {
            console.log('Could not parse response as JSON');
        }

        if (response.ok) {
            console.log('✅ Login successful!');
        } else {
            console.log('❌ Login failed');
        }

    } catch (error) {
        console.error('❌ Error during login:', error.message);
    }
}

testLogin();