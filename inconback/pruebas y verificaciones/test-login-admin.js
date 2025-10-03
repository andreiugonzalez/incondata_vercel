const { default: fetch } = require('node-fetch');

async function testLoginAdmin() {
  const loginData = {
    email: 'admin@tudominio.com',
    password: 'contra123',
  };

  console.log('Testing admin login with:');
  console.log('Email:', JSON.stringify(loginData.email));
  console.log('Password:', JSON.stringify(loginData.password));

  try {
    const response = await fetch('http://localhost:3111/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body (raw):', responseText);

    let jsonData = null;
    try {
      jsonData = JSON.parse(responseText);
      console.log('Response body (parsed):', jsonData);
    } catch (parseError) {
      console.log('Could not parse response as JSON');
    }

    if (response.ok) {
      console.log('✅ Login successful!');
      if (jsonData && jsonData.data) {
        console.log('Token present:', Boolean(jsonData.data.token));
        console.log('User email:', jsonData.data.user?.email);
        console.log('User roles:', jsonData.data.user?.roles?.map(r => r.name || r));
        console.log('isTemporaryPassword:', jsonData.data.user?.isTemporaryPassword);
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error during login:', error.message);
  }
}

testLoginAdmin();