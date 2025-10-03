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
    logging: false // Desactivar logs de SQL para mayor claridad
  }
);

// Importar los modelos necesarios
const userRepository = require('./src/repositories/user.repository');

async function testGetRolContratista() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos.');

    // Inicializar el repositorio
    console.log('\n=== PROBANDO getUserContratista() ===');
    
    try {
      const contratistaUsers = await userRepository.getUserContratista();
      
      if (!contratistaUsers || contratistaUsers.length === 0) {
        console.log('❌ No se encontraron usuarios contratistas');
      } else {
        console.log(`✅ Se encontraron ${contratistaUsers.length} usuarios contratistas:`);
        contratistaUsers.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}, Email: ${user.email}`);
          if (user.userRoles) {
            console.log(`   Roles: ${user.userRoles.map(ur => ur.Rol?.name || 'N/A').join(', ')}`);
          }
          if (user.organizacion) {
            console.log(`   Organización: ${user.organizacion.nombre || 'N/A'}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al ejecutar getUserContratista():', error.message);
      console.error('Stack trace:', error.stack);
    }

    console.log('\n=== PROBANDO getUsers() (método general) ===');
    
    try {
      const allUsers = await userRepository.getUsers();
      
      if (!allUsers || allUsers.length === 0) {
        console.log('❌ No se encontraron usuarios');
      } else {
        console.log(`✅ Se encontraron ${allUsers.length} usuarios en total`);
        
        // Filtrar usuarios con rol contratista
        const contratistaFromAll = allUsers.filter(user => 
          user.userRoles && user.userRoles.some(ur => ur.Rol && ur.Rol.name === 'contratista')
        );
        
        if (contratistaFromAll.length > 0) {
          console.log(`✅ Usuarios con rol contratista encontrados en getUsers():`);
          contratistaFromAll.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}, Email: ${user.email}`);
          });
        } else {
          console.log('❌ No se encontraron usuarios con rol contratista en getUsers()');
        }
      }
    } catch (error) {
      console.error('❌ Error al ejecutar getUsers():', error.message);
      console.error('Stack trace:', error.stack);
    }

    console.log('\n=== VERIFICANDO ENDPOINT /user/users/contratista ===');
    
    // Simular la llamada al controlador SelectGenericoController
    try {
      const SelectGenericoController = require('./src/controllers/selectgenerico.controller');
      
      // Crear un mock de request y response
      const mockReq = {};
      const mockRes = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.responseData = data;
          return this;
        }
      };

      await SelectGenericoController.getUserContratista(mockReq, mockRes);
      
      if (mockRes.statusCode === 200) {
        console.log('✅ Endpoint /user/users/contratista respondió correctamente');
        console.log('Datos devueltos:', JSON.stringify(mockRes.responseData, null, 2));
      } else {
        console.log(`❌ Endpoint respondió con código ${mockRes.statusCode}`);
        console.log('Respuesta:', mockRes.responseData);
      }
      
    } catch (error) {
      console.error('❌ Error al probar el endpoint:', error.message);
      console.error('Stack trace:', error.stack);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada.');
  }
}

testGetRolContratista();