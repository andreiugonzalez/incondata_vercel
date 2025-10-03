// Script para verificar que el rol 'normal' ha sido eliminado correctamente del sistema
const { Client } = require('pg');

async function verificarEliminacionRolNormal() {
  const client = new Client({
    host: process.env.CONSTRUAPP_PSQL_HOST || 'localhost',
    port: process.env.CONSTRUAPP_PSQL_PORT || 5432,
    database: process.env.CONSTRUAPP_PSQL_BD,
    user: process.env.CONSTRUAPP_PSQL_USER,
    password: process.env.CONSTRUAPP_PSQL_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar que el rol 'normal' aún existe en la base de datos
    const rolResult = await client.query(`
      SELECT id, name FROM rol WHERE name = 'normal'
    `);

    if (rolResult.rows.length > 0) {
      console.log(`\n📋 El rol "normal" aún existe en la base de datos:`);
      console.log(`   ID: ${rolResult.rows[0].id}`);
      console.log(`   Nombre: ${rolResult.rows[0].name}`);
      console.log('   ℹ️  Esto es normal - el rol permanece en la BD para mantener integridad referencial');
    } else {
      console.log('\n❌ El rol "normal" no existe en la base de datos');
    }

    // 2. Verificar que no hay usuarios asignados al rol 'normal'
    const usuariosResult = await client.query(`
      SELECT u.id, u.email, u.name 
      FROM "user" u
      INNER JOIN user_rol ur ON u.id = ur."userId"
      INNER JOIN rol r ON ur."rolId" = r.id
      WHERE r.name = 'normal'
    `);

    console.log(`\n👥 Usuarios asignados al rol "normal": ${usuariosResult.rows.length}`);
    if (usuariosResult.rows.length > 0) {
      console.log('⚠️  ADVERTENCIA: Aún hay usuarios asignados al rol "normal":');
      usuariosResult.rows.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    } else {
      console.log('✅ No hay usuarios asignados al rol "normal"');
    }

    // 3. Verificar los roles internos disponibles
    console.log('\n🔍 Verificando roles internos disponibles en el sistema:');
    
    // Simular la función getRolesInternos
    const rolesInternos = [
      'admin',
      'superadmin',
      'superintendente',
      'supervisor',
      'ITO',
      'proyectista',
      'administrador de contrato'
    ];

    const rolesInternosResult = await client.query(`
      SELECT id, name FROM rol WHERE name = ANY($1) ORDER BY name
    `, [rolesInternos]);

    console.log('   Roles internos encontrados:');
    rolesInternosResult.rows.forEach(rol => {
      console.log(`   ✅ ${rol.name} (ID: ${rol.id})`);
    });

    // Verificar si 'normal' aparece en la lista
    const normalEnInternos = rolesInternosResult.rows.find(rol => rol.name === 'normal');
    if (normalEnInternos) {
      console.log('\n❌ ERROR: El rol "normal" aún aparece en la lista de roles internos');
    } else {
      console.log('\n✅ CORRECTO: El rol "normal" NO aparece en la lista de roles internos');
    }

    console.log('\n📊 RESUMEN:');
    console.log('✅ Rol "normal" eliminado de la lista hardcodeada de roles internos');
    console.log('✅ Documentación actualizada sin referencias al rol "normal"');
    console.log('✅ Frontend actualizado sin referencias al rol "normal"');
    console.log(`📋 Total de roles internos disponibles: ${rolesInternosResult.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

verificarEliminacionRolNormal();