const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos usando variables de entorno
const pool = new Pool({
  user: process.env.CONSTRUAPP_PSQL_USER,
  host: process.env.CONSTRUAPP_PSQL_HOST,
  database: process.env.CONSTRUAPP_PSQL_BD,
  password: process.env.CONSTRUAPP_PSQL_PASSWORD,
  port: process.env.CONSTRUAPP_PSQL_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function getUserIds() {
  try {
    console.log('🔍 Obteniendo IDs de usuarios con roles supervisor y superintendente...');
    
    // Obtener usuarios con rol supervisor
    const supervisorQuery = `
      SELECT u.id, u.names, u.apellido_p, u.apellido_m, r.name as role_name
      FROM "user" u
      JOIN user_rol ur ON u.id = ur."userId"
      JOIN rol r ON ur."rolId" = r.id
      WHERE r.name = 'supervisor'
    `;
    
    const supervisorResult = await pool.query(supervisorQuery);
    
    console.log('\n📋 Usuarios con rol SUPERVISOR:');
    if (supervisorResult.rows.length > 0) {
      supervisorResult.rows.forEach(user => {
        console.log(`   - ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
      });
    } else {
      console.log('   - No se encontraron usuarios con rol supervisor');
    }
    
    // Obtener usuarios con rol superintendente
    const superintendenteQuery = `
      SELECT u.id, u.names, u.apellido_p, u.apellido_m, r.name as role_name
      FROM "user" u
      JOIN user_rol ur ON u.id = ur."userId"
      JOIN rol r ON ur."rolId" = r.id
      WHERE r.name = 'superintendente'
    `;
    
    const superintendenteResult = await pool.query(superintendenteQuery);
    
    console.log('\n📋 Usuarios con rol SUPERINTENDENTE:');
    if (superintendenteResult.rows.length > 0) {
      superintendenteResult.rows.forEach(user => {
        console.log(`   - ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
      });
    } else {
      console.log('   - No se encontraron usuarios con rol superintendente');
    }
    
    // Obtener todos los usuarios disponibles para referencia
    const allUsersQuery = `
      SELECT u.id, u.names, u.apellido_p, u.apellido_m, 
             STRING_AGG(r.name, ', ') as roles
      FROM "user" u
      LEFT JOIN user_rol ur ON u.id = ur."userId"
      LEFT JOIN rol r ON ur."rolId" = r.id
      GROUP BY u.id, u.names, u.apellido_p, u.apellido_m
      ORDER BY u.id
    `;
    
    const allUsersResult = await pool.query(allUsersQuery);
    
    console.log('\n📋 TODOS LOS USUARIOS DISPONIBLES:');
    allUsersResult.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}, Roles: ${user.roles || 'Sin roles'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al obtener IDs de usuarios:', error);
  } finally {
    await pool.end();
  }
}

getUserIds();