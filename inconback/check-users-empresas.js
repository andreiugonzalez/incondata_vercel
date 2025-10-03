const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

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

async function checkUsersAndOrganizations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    console.log('\n=== VERIFICANDO USUARIO CARLOS GONZALEZ ===');
    
    const [carlosUser] = await sequelize.query(`
      SELECT u.id, u.names, u.apellido_p, u.apellido_m, u.email, u.username, u.organizacionid
      FROM "user" u
      WHERE u.email = 'carlos.gonzalez@incondata.cl'
    `);
    
    if (carlosUser.length > 0) {
      const user = carlosUser[0];
      console.log('Usuario encontrado:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Organización ID: ${user.organizacionid}`);
      
      // Verificar roles
      const [userRoles] = await sequelize.query(`
        SELECT r.id, r.name
        FROM rol r
        JOIN user_rol ur ON r.id = ur."rolId"
        WHERE ur."userId" = ${user.id}
      `);
      
      console.log('\nRoles del usuario:');
      userRoles.forEach(role => {
        console.log(`- ${role.name} (ID: ${role.id})`);
      });
      
      // Verificar organización
      if (user.organizacionid) {
        const [org] = await sequelize.query(`
          SELECT id, nombre
          FROM organizacion
          WHERE id = ${user.organizacionid}
        `);
        
        if (org.length > 0) {
          console.log('\nOrganización asociada:');
          console.log(`- ID: ${org[0].id}`);
          console.log(`- Nombre: ${org[0].nombre}`);
        }
      } else {
        console.log('\n❌ Usuario NO tiene organización asociada');
      }
    } else {
      console.log('❌ Usuario carlos.gonzalez@incondata.cl NO encontrado');
    }
    
    console.log('\n=== VERIFICANDO USUARIO SUPERADMIN3 ===');
    
    const [superadminUser] = await sequelize.query(`
      SELECT u.id, u.names, u.apellido_p, u.apellido_m, u.email, u.username, u.organizacionid
      FROM "user" u
      WHERE u.email = 'superadmin3@gmail.com'
    `);
    
    if (superadminUser.length > 0) {
      const user = superadminUser[0];
      console.log('Usuario encontrado:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Organización ID: ${user.organizacionid}`);
      
      // Verificar roles
      const [userRoles] = await sequelize.query(`
        SELECT r.id, r.name
        FROM rol r
        JOIN user_rol ur ON r.id = ur."rolId"
        WHERE ur."userId" = ${user.id}
      `);
      
      console.log('\nRoles del usuario:');
      userRoles.forEach(role => {
        console.log(`- ${role.name} (ID: ${role.id})`);
      });
      
      // Verificar organización
      if (user.organizacionid) {
        const [org] = await sequelize.query(`
          SELECT id, nombre
          FROM organizacion
          WHERE id = ${user.organizacionid}
        `);
        
        if (org.length > 0) {
          console.log('\nOrganización asociada:');
          console.log(`- ID: ${org[0].id}`);
          console.log(`- Nombre: ${org[0].nombre}`);
        }
      } else {
        console.log('\n❌ Usuario NO tiene organización asociada');
      }
    } else {
      console.log('❌ Usuario superadmin3@gmail.com NO encontrado');
    }
    
    // Mostrar todas las organizaciones disponibles
    console.log('\n=== TODAS LAS ORGANIZACIONES DISPONIBLES ===');
    const [allOrgs] = await sequelize.query(`
      SELECT id, nombre
      FROM organizacion
      ORDER BY nombre
    `);
    
    console.log(`Total de organizaciones: ${allOrgs.length}`);
    allOrgs.forEach(org => {
      console.log(`- ID: ${org.id}, Nombre: ${org.nombre}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsersAndOrganizations();