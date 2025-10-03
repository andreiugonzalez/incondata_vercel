const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.CONSTRUAPP_PSQL_USER,
  host: process.env.CONSTRUAPP_PSQL_HOST,
  database: process.env.CONSTRUAPP_PSQL_BD,
  password: process.env.CONSTRUAPP_PSQL_PASSWORD,
  port: process.env.CONSTRUAPP_PSQL_PORT,
});

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de tabla EstadoProyecto...\n');

    const result = await pool.query('SELECT * FROM "EstadoProyecto" LIMIT 1');
    
    if (result.rows.length > 0) {
      console.log('Columnas disponibles:', Object.keys(result.rows[0]));
      console.log('Datos de ejemplo:', result.rows[0]);
    } else {
      console.log('La tabla está vacía, verificando estructura...');
      const structureResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'EstadoProyecto'
      `);
      console.log('Estructura de la tabla:', structureResult.rows);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();