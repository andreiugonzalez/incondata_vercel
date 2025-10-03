const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.CONSTRUAPP_PSQL_USER,
  host: process.env.CONSTRUAPP_PSQL_HOST,
  database: process.env.CONSTRUAPP_PSQL_BD,
  password: process.env.CONSTRUAPP_PSQL_PASSWORD,
  port: process.env.CONSTRUAPP_PSQL_PORT,
});

async function checkValidIds() {
  try {
    console.log('🔍 Verificando IDs válidos en la base de datos...\n');

    // Verificar minas disponibles
    console.log('📍 Minas disponibles:');
    const minasResult = await pool.query('SELECT id, name FROM "Mine" ORDER BY id');
    if (minasResult.rows.length > 0) {
      minasResult.rows.forEach(mina => {
        console.log(`  ID: ${mina.id}, Nombre: ${mina.name}`);
      });
    } else {
      console.log('  ❌ No se encontraron minas en la base de datos');
    }

    console.log('\n📊 Estados de proyecto disponibles:');
    const estadosResult = await pool.query('SELECT id_estado_proyecto, nombre FROM "EstadoProyecto" ORDER BY id_estado_proyecto');
    if (estadosResult.rows.length > 0) {
      estadosResult.rows.forEach(estado => {
        console.log(`  ID: ${estado.id_estado_proyecto}, Nombre: ${estado.nombre}`);
      });
    } else {
      console.log('  ❌ No se encontraron estados de proyecto en la base de datos');
    }

    console.log('\n🏢 Organizaciones disponibles:');
    const organizacionesResult = await pool.query('SELECT id, nombre FROM "organizacion" ORDER BY id');
    if (organizacionesResult.rows.length > 0) {
      organizacionesResult.rows.forEach(org => {
        console.log(`  ID: ${org.id}, Nombre: ${org.nombre}`);
      });
    } else {
      console.log('  ❌ No se encontraron organizaciones en la base de datos');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error al verificar IDs:', error.message);
  } finally {
    await pool.end();
  }
}

checkValidIds();