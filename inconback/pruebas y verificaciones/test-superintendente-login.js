const axios = require('axios');

async function testSuperintendenteLogin() {
  console.log('🔍 Probando login del usuario superintendente...');
  
  const loginData = {
    email: 'superintendente@sistema.com',
    password: 'intendente123'
  };

  try {
    const response = await axios.post('http://localhost:3111/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('🔑 Token JWT recibido correctamente');
    }
    
    if (response.data.user) {
      console.log('👤 Información del usuario:');
      console.log('   - ID:', response.data.user.id);
      console.log('   - Nombre:', response.data.user.names);
      console.log('   - Email:', response.data.user.email);
      console.log('   - RUT:', response.data.user.rut);
      console.log('   - Username:', response.data.user.username);
      
      if (response.data.user.roles) {
        console.log('   - Roles:', response.data.user.roles.map(role => role.name).join(', '));
      }
    }

  } catch (error) {
    console.error('❌ Error en el login:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Ejecutar la prueba
testSuperintendenteLogin();