// Script para verificar roles en la base de datos
require('dotenv').config();
const { Client } = require('pg');

async function verificarRoles() {
  const client = new Client({
    host: process.env.CONSTRUAPP_PSQL_HOST,
    port: process.env.CONSTRUAPP_PSQL_PORT,
    database: process.env.CONSTRUAPP_PSQL_BD,
    user: process.env.CONSTRUAPP_PSQL_USER,
    password: process.env.CONSTRUAPP_PSQL_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Consultar todos los roles disponibles
    const result = await client.query('SELECT id, name FROM rol ORDER BY name');
    
    console.log('\n📋 Roles encontrados en la base de datos:');
    result.rows.forEach(rol => {
      console.log(`  - ID: ${rol.id}, Nombre: "${rol.name}"`);
    });

    // Lista de roles internos que deberían existir
    const rolesInternos = ['admin', 'superadmin', 'superintendente', 'administrador de contrato', 'supervisor', 'ITO', 'proyectista', 'normal'];
    
    console.log('\n🔍 Verificando roles internos requeridos:');
    const rolesEncontrados = result.rows.map(r => r.name);
    
    rolesInternos.forEach(rol => {
      const existe = rolesEncontrados.includes(rol);
      console.log(`  ${existe ? '✅' : '❌'} ${rol}`);
    });

    // Mostrar roles que existen pero no están en la lista de internos
    const rolesExtra = rolesEncontrados.filter(rol => !rolesInternos.includes(rol));
    if (rolesExtra.length > 0) {
      console.log('\n📝 Otros roles encontrados:');
      rolesExtra.forEach(rol => {
        console.log(`  - ${rol}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al conectar o consultar la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

verificarRoles();