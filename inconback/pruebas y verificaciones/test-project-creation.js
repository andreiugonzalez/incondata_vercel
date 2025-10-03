const axios = require('axios');

async function testProjectCreation() {
  try {
    console.log('🔍 Probando la creación de proyectos con usuario superadmin...');
    
    // Paso 1: Login
    console.log('\n📤 Paso 1: Realizando login...');
    const loginData = {
      email: 'gerardo.incondata@gmail.com',
      password: 'superadmin2024'
    };

    const loginResponse = await axios.post('http://localhost:3111/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso!');
    console.log(`   Status: ${loginResponse.status}`);
    
    // Extraer token y datos del usuario
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log(`   Token: ${token ? 'Generado correctamente' : 'No generado'}`);
    
    if (user) {
      console.log(`   Usuario: ${user.username}`);
      console.log(`   Roles: ${JSON.stringify(user.roles.map(r => r.name))}`);
    } else {
      console.log('   Usuario: No disponible en la respuesta');
    }

    // Paso 2: Intentar crear un proyecto
    console.log('\n📤 Paso 2: Intentando crear un proyecto...');
    const projectData = {
      nombre: 'Proyecto de Prueba SuperAdmin',
      descripcion: 'Proyecto creado para probar permisos de superadmin',
      fecha_inicio: '2024-01-15',
      fecha_termino: '2024-12-31',
      ubicacion: 'Ubicación de prueba',
      codigo_bip: 12345,
      unidad_tecnica: 'Unidad Técnica de Prueba',
      supervisor: 79, // ID numérico directo como lo envía el frontend
      superintendente: 77, // ID numérico directo como lo envía el frontend
      rut_unidad_tecnica: '12345678-9',
      rut_empresa: '87654321-0',
      presupuesto: 1000000,
      duenio: 'Dueño de Prueba',
      monto_neto: 800000,
      monto_total_bruto: 1000000,
      monto_mensual: 100000,
      total_general: 1000000,
      localizacion_mina: 'Localización de la mina',
      informador: 'Informador de Prueba',
      id_estadoproyecto: 1,
      id_mina: 32,
      avance: 0,
      organizacion_id: 1,
      mina_id: 32,
      activo: true
    };

    const projectResponse = await axios.post('http://localhost:3111/projects', projectData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

    console.log('✅ Proyecto creado exitosamente!');
    console.log(`   Status: ${projectResponse.status}`);
    console.log(`   Proyecto ID: ${projectResponse.data.id}`);
    console.log(`   Nombre: ${projectResponse.data.nombre}`);

  } catch (error) {
    console.log('❌ Error en la prueba:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Status Text: ${error.response.statusText}`);
      console.log(`   Message: ${error.response.data?.message || 'Sin mensaje'}`);
      console.log(`   Error: ${error.response.data?.error || 'Sin error específico'}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.log(`   No response received: ${error.message}`);
      console.log(`   Error code: ${error.code || 'Sin código'}`);
      console.log(`   Error details: Connection failed or server not responding`);
    } else {
      console.log(`   Message: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }
  }
}

testProjectCreation();