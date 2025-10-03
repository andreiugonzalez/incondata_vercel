// Script para verificar usuarios asignados al rol 'normal'
require('dotenv').config();
const { Client } = require('pg');

async function verificarUsuariosRolNormal() {
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

    // Buscar el ID del rol 'normal'
    const rolResult = await client.query("SELECT id FROM rol WHERE name = 'normal'");
    
    if (rolResult.rows.length === 0) {
      console.log('❌ No se encontró el rol "normal" en la base de datos');
      return;
    }

    const rolNormalId = rolResult.rows[0].id;
    console.log(`📋 ID del rol "normal": ${rolNormalId}`);

    // Buscar usuarios asignados a este rol
    const usuariosResult = await client.query(`
      SELECT ur."userId", u.names, u.apellido_p, u.apellido_m, u.email, u.username 
      FROM user_rol ur 
      JOIN "user" u ON ur."userId" = u.id 
      WHERE ur."rolId" = $1
    `, [rolNormalId]);

    console.log(`\n🔍 Usuarios encontrados con rol "normal": ${usuariosResult.rows.length}`);
    
    if (usuariosResult.rows.length > 0) {
      console.log('\n👥 Lista de usuarios:');
      usuariosResult.rows.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m}`);
        console.log(`     Email: ${usuario.email}`);
        console.log(`     Username: ${usuario.username}`);
        console.log(`     ID: ${usuario.userId}`);
        console.log('');
      });
      
      console.log('⚠️  ADVERTENCIA: Hay usuarios asignados al rol "normal".');
      console.log('   Debes reasignar estos usuarios a otro rol antes de eliminar el rol "normal".');
    } else {
      console.log('✅ No hay usuarios asignados al rol "normal". Es seguro eliminarlo.');
    }

  } catch (error) {
    console.error('❌ Error al conectar o consultar la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

verificarUsuariosRolNormal();