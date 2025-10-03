const axios = require('axios');

async function testSuperAdminEndpoint() {
  try {
    console.log('🔍 Probando el nuevo endpoint de verificación de superadmin...');
    
    const response = await axios.get('http://localhost:3111/check-superadmin');
    
    console.log('✅ Respuesta exitosa:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.exists) {
      console.log('🎉 Usuario superadmin encontrado:');
      console.log('   Nombre:', response.data.data.user?.names);
      console.log('   Email:', response.data.data.user?.email);
      console.log('   RUT:', response.data.data.user?.rut);
    } else {
      console.log('⚠️ No se encontró usuario superadmin');
    }
    
  } catch (error) {
    console.error('❌ Error probando el endpoint:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Data:', error.response?.data);
  }
}

testSuperAdminEndpoint();