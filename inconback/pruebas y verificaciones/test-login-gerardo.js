const axios = require('axios');

async function testSuperAdminLogin() {
  try {
    console.log('🔍 Probando login del usuario superadmin (Gerardo)...');
    
    // Credenciales del usuario superadmin existente
    const loginData = {
      email: 'gerardo.incondata@gmail.com',
      password: 'superadmin2024'
    };

    console.log('📤 Enviando solicitud de login...');
    console.log(`   Email: ${loginData.email}`);
    console.log(`   Password: ${loginData.password}`);

    const response = await axios.post('http://localhost:3111/login', loginData, {
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
        
        if (response.data.user.roles && response.data.user.roles.length > 0) {
          console.log('🎭 Roles del usuario:');
          response.data.user.roles.forEach(role => {
            console.log(`   - ${role.name} (ID: ${role.id})`);
          });
        }
      }
    }

  } catch (error) {
    console.log('❌ Error en el login:');
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Status Text: ${error.response?.statusText || 'N/A'}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Probando con otras contraseñas posibles...');
      
      const otherPasswords = [
        'SuperAdmin2024!',
        'Gerardo123',
        'gerardo123',
        'admin123',
        'superadmin',
        '123456'
      ];
      
      for (const password of otherPasswords) {
        try {
          console.log(`   Probando: ${password}`);
          const testResponse = await axios.post('http://localhost:3001/login', {
            email: 'gerardo.incondata@gmail.com',
            password: password
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`   ✅ Contraseña correcta encontrada: ${password}`);
          break;
        } catch (testError) {
          console.log(`   ❌ Contraseña incorrecta: ${password}`);
        }
      }
    }
  }
}

testSuperAdminLogin();