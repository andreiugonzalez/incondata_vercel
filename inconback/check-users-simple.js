const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    host: '52.22.171.179',
    port: 5432,
    database: 'incondata_demo',
    user: 'usr_prac2025',
    password: 'Usr*2025.'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Consultar usuarios
    const result = await client.query(`
      SELECT u.id, u.names, u.apellido_p, u.email, u.username, u.rut, 
             array_agg(r.name) as roles
      FROM "user" u
      LEFT JOIN user_rol ur ON u.id = ur."userId"
      LEFT JOIN rol r ON ur."rolId" = r.id
      GROUP BY u.id, u.names, u.apellido_p, u.email, u.username, u.rut
      ORDER BY u.id
      LIMIT 20
    `);

    console.log('\n📋 Usuarios encontrados:');
    result.rows.forEach(user => {
      const roles = user.roles && user.roles[0] ? user.roles.join(', ') : 'Sin roles';
      console.log(`ID: ${user.id}`);
      console.log(`  Nombre: ${user.names} ${user.apellido_p || ''}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  RUT: ${user.rut}`);
      console.log(`  Roles: ${roles}`);
      console.log('---');
    });

    // Buscar específicamente usuarios admin/superadmin
    const adminResult = await client.query(`
      SELECT u.id, u.names, u.apellido_p, u.email, u.username, u.rut, r.name as role
      FROM "user" u
      JOIN user_rol ur ON u.id = ur."userId"
      JOIN rol r ON ur."rolId" = r.id
      WHERE r.name IN ('admin', 'superadmin')
      ORDER BY r.name, u.id
    `);

    console.log('\n🔑 Usuarios con roles admin/superadmin:');
    if (adminResult.rows.length === 0) {
      console.log('❌ No se encontraron usuarios con roles admin o superadmin');
    } else {
      adminResult.rows.forEach(user => {
        console.log(`${user.role.toUpperCase()}: ${user.names} ${user.apellido_p || ''} (${user.email}) - Username: ${user.username}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();