const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crear la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD, 
  process.env.CONSTRUAPP_PSQL_USER, 
  process.env.CONSTRUAPP_PSQL_PASSWORD, 
  {
    host: process.env.CONSTRUAPP_PSQL_HOST,
    port: process.env.CONSTRUAPP_PSQL_PORT || 5432,
    dialect: 'postgres',
    logging: false // Desactivamos el logging para tener una salida más limpia
  }
);

// Función para consultar la tabla de usuarios
async function consultarUsuarios() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Consultar la tabla de usuarios
    // Primero verificamos si la tabla existe
    try {
      const result = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user'
      `);
      
      console.log('Columnas de la tabla user:');
      console.log(result[0]);
      
      // Consultar los usuarios
      const usuarios = await sequelize.query('SELECT * FROM "user" LIMIT 10');
      console.log('\nUsuarios (primeros 10):');
      console.log(JSON.stringify(usuarios[0], null, 2));
      
    } catch (error) {
      // Si hay un error, puede que la tabla tenga otro nombre
      console.log('❌ Error al consultar la tabla "user":', error.message);
      console.log('Intentando buscar tablas relacionadas con usuarios...');
      
      const tablas = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND (table_name LIKE '%user%' OR table_name LIKE '%usuario%')
      `);
      
      console.log('\nTablas relacionadas con usuarios:');
      console.log(tablas[0]);
    }
    
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
    console.log('\nConexión cerrada.');
  }
}

consultarUsuarios();