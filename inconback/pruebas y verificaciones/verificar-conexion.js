const { Sequelize } = require('sequelize');
require('dotenv').config();

// Mostrar las variables de entorno (sin mostrar contraseñas)
console.log('Variables de entorno:');
console.log('DB_NAME:', process.env.CONSTRUAPP_PSQL_BD);
console.log('DB_USER:', process.env.CONSTRUAPP_PSQL_USER);
console.log('DB_HOST:', process.env.CONSTRUAPP_PSQL_HOST);
console.log('DB_PORT:', process.env.CONSTRUAPP_PSQL_PORT);

// Crear la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD, 
  process.env.CONSTRUAPP_PSQL_USER, 
  process.env.CONSTRUAPP_PSQL_PASSWORD, 
  {
    host: process.env.CONSTRUAPP_PSQL_HOST,
    port: process.env.CONSTRUAPP_PSQL_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

// Probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Intentar hacer una consulta simple
    const result = await sequelize.query('SELECT NOW() as time');
    console.log('✅ Consulta ejecutada correctamente. Hora del servidor:', result[0][0].time);
    
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    return false;
  } finally {
    // Cerrar la conexión
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
}

testConnection();