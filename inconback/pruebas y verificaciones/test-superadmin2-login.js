const axios = require('axios');

async function testSuperAdmin2Login() {
  try {
    console.log('🔍 Probando login del usuario superadmin2...');
    
    const loginData = {
      email: 'superadmin2@sistema.com',
      password: 'super123'
    };

    console.log('📤 Enviando solicitud de login...');
    console.log(`   Email: ${loginData.email}`);
    console.log(`   Password: ${loginData.password}`);

    const response = await axios.post('http://localhost:3001/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    if (response.data) {
      console.log('📋 Datos de respuesta:');
      console.log(`   Token: ${response.data.token ? 'Generado correctamente' : 'No generado'}`);
      
      if (response.data.user) {
        console.log('👤 Información del usuario:');
        console.log(`   - ID: ${response.data.user.id}`);
        console.log(`   - RUT: ${response.data.user.rut}`);
        console.log(`   - Nombre: ${response.data.user.names} ${response.data.user.apellido_p} ${response.data.user.apellido_m}`);
        console.log(`   - Email: ${response.data.user.email}`);
        console.log(`   - Username: ${response.data.user.username}`);
        
        if (response.data.user.Rols && response.data.user.Rols.length > 0) {
          const roles = response.data.user.Rols.map(rol => rol.name).join(', ');
          console.log(`   - Roles: ${roles}`);
        }
      }
      
      if (response.data.token) {
        console.log('🔑 Token JWT:');
        console.log(`   ${response.data.token.substring(0, 50)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Error en el login:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Status Text: ${error.response.statusText}`);
      console.log(`   Data:`, error.response.data);
    } else if (error.request) {
      console.log('   No se recibió respuesta del servidor');
      console.log('   Verifica que el servidor esté ejecutándose en http://localhost:3001');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Ejecutar el test
testSuperAdmin2Login();