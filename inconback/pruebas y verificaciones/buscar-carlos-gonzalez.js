const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

// Configuración de la base de datos
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect,
    port: config.development.port,
    logging: false
  }
);

async function buscarCarlosGonzalez() {
  try {
    console.log('🔍 Buscando usuario Carlos González...');
    
    // Buscar usuario por email
    const [usuarios] = await sequelize.query(`
      SELECT u.*, 
             ur.id as user_rol_id,
             ur.rolid,
             r.name as rol_name
      FROM "user" u
      LEFT JOIN user_rol ur ON u.id = ur.userId
      LEFT JOIN rol r ON ur.rolid = r.id
      WHERE u.email = 'carlos.gonzalez@incondata.cl'
    `);

    if (usuarios.length === 0) {
      console.log('❌ Usuario Carlos González no encontrado');
      return;
    }

    console.log('✅ Usuario Carlos González encontrado:');
    const usuario = usuarios[0];
    
    console.log(`   - ID: ${usuario.id}`);
    console.log(`   - Nombre: ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m}`);
    console.log(`   - Email: ${usuario.email}`);
    console.log(`   - RUT: ${usuario.rut}`);
    console.log(`   - Username: ${usuario.username}`);
    
    // Verificar roles
    if (usuario.user_rol_id) {
      console.log(`   - Rol ID: ${usuario.rolid}`);
      console.log(`   - Rol Nombre: ${usuario.rol_name}`);
    } else {
      console.log('   - ⚠️  NO TIENE ROLES ASIGNADOS');
    }

    // Buscar todos los roles disponibles
    console.log('\n📋 Roles disponibles en el sistema:');
    const [roles] = await sequelize.query('SELECT * FROM rol ORDER BY id');
    
    roles.forEach(rol => {
      console.log(`   - ID: ${rol.id} | Nombre: ${rol.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

buscarCarlosGonzalez();