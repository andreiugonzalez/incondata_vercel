const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

// Configuración de la base de datos
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect,
    port: config.development.port,
    logging: console.log
  }
);

async function checkContratistaUsers() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos.');

    // Buscar el rol 'contratista'
    console.log('\n=== VERIFICANDO ROL CONTRATISTA ===');
    const [contratistaRoles] = await sequelize.query(`
      SELECT id, name FROM rol WHERE name = 'contratista'
    `);
    
    if (contratistaRoles.length === 0) {
      console.log('❌ No se encontró el rol "contratista" en la base de datos');
      
      // Mostrar todos los roles disponibles
      console.log('\n=== ROLES DISPONIBLES ===');
      const [allRoles] = await sequelize.query(`
        SELECT id, name FROM rol ORDER BY name
      `);
      
      allRoles.forEach(role => {
        console.log(`- ID: ${role.id}, Nombre: ${role.name}`);
      });
      
    } else {
      console.log('✅ Rol "contratista" encontrado:');
      contratistaRoles.forEach(role => {
        console.log(`- ID: ${role.id}, Nombre: ${role.name}`);
      });

      // Buscar usuarios con rol contratista
      console.log('\n=== USUARIOS CON ROL CONTRATISTA ===');
      const query = `
        SELECT u.id, u.names, u.apellido_p, u.apellido_m, u.email, u.username, r.name as role_name
        FROM "user" u
        JOIN user_rol ur ON u.id = ur."userId"
        JOIN rol r ON ur."rolId" = r.id
        WHERE r.name = 'contratista'
        ORDER BY u.id;
      `;
      const [contratistaUsers] = await sequelize.query(query);

      if (contratistaUsers.length === 0) {
        console.log('❌ No hay usuarios con el rol "contratista"');
      } else {
        console.log(`✅ Se encontraron ${contratistaUsers.length} usuarios con rol "contratista":`);
        contratistaUsers.forEach(user => {
          console.log(`- ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}, Email: ${user.email}`);
        });
      }
    }

    // Verificar todos los usuarios y sus roles
    console.log('\n=== TODOS LOS USUARIOS Y SUS ROLES ===');
    const [allUsersWithRoles] = await sequelize.query(`
      SELECT 
        u.id,
        u.names,
        u.apellido_p,
        u.apellido_m,
        u.email,
        r.name as rol_name
      FROM "user" u
      INNER JOIN user_rol ur ON u.id = ur."userId"
      INNER JOIN rol r ON ur."rolId" = r.id
      ORDER BY u.id, r.name
    `);

    const userRoleMap = {};
    allUsersWithRoles.forEach(user => {
      if (!userRoleMap[user.id]) {
        userRoleMap[user.id] = {
          id: user.id,
          name: `${user.names} ${user.apellido_p} ${user.apellido_m}`,
          email: user.email,
          roles: []
        };
      }
      userRoleMap[user.id].roles.push(user.rol_name);
    });

    Object.values(userRoleMap).forEach(user => {
      console.log(`- ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Roles: [${user.roles.join(', ')}]`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkContratistaUsers();