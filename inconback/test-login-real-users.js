const axios = require('axios');

const BACKEND_URL = 'http://localhost:3111';

// Usuarios encontrados en la base de datos
const testUsers = [
  {
    name: 'Gerardo (superadmin)',
    email: 'gerardo.incondata@gmail.com',
    password: 'superadmin2024' // Contraseña común para testing
  },
  {
    name: 'Andriu (admin)',
    email: 'andri14722005@gmail.com',
    password: 'admin123'
  },
  {
    name: 'María (admin)',
    email: 'maria.rodriguez@incondata.cl',
    password: 'admin123'
  }
];

async function testLogin(user) {
  try {
    console.log(`\n🔐 Probando login para ${user.name}:`);
    console.log(`   Email: ${user.email}`);
    
    const response = await axios.post(`${BACKEND_URL}/login`, {
      email: user.email,
      password: user.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ Login exitoso');
      console.log(`   Token: ${response.data.data.token.substring(0, 50)}...`);
      console.log(`   Usuario: ${response.data.data.user.names} ${response.data.data.user.apellido_p}`);
      console.log(`   Roles: ${response.data.data.user.roles.map(r => r.name).join(', ')}`);
      
      return {
        success: true,
        token: response.data.data.token,
        user: response.data.data.user
      };
    }
  } catch (error) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Mensaje: ${error.response.data.message || 'Sin mensaje'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testProjectCreation(token, user) {
  try {
    console.log(`\n📋 Probando creación de proyecto con ${user.names}:`);
    
    const projectData = {
      nombre: `Proyecto Test ${Date.now()}`,
      descripcion: 'Proyecto de prueba para verificar funcionalidad',
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-12-31',
      presupuesto: 1000000,
      estado: 'planificacion'
    };

    const response = await axios.post(`${BACKEND_URL}/projects`, projectData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Proyecto creado exitosamente');
      console.log(`   ID: ${response.data.data.id}`);
      console.log(`   Nombre: ${response.data.data.nombre}`);
      return { success: true, project: response.data.data };
    }
  } catch (error) {
    console.log('❌ Error creando proyecto:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Mensaje: ${error.response.data.message || 'Sin mensaje'}`);
      if (error.response.data.error) {
        console.log(`   Error detallado: ${error.response.data.error}`);
      }
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de login y creación de proyecto...');
  
  for (const user of testUsers) {
    const loginResult = await testLogin(user);
    
    if (loginResult.success) {
      // Si el login fue exitoso, probar creación de proyecto
      await testProjectCreation(loginResult.token, loginResult.user);
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  console.log('\n✅ Pruebas completadas');
}

runTests().catch(console.error);