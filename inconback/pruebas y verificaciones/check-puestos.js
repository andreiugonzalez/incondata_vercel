const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos usando variables de entorno
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
  {
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: 'postgres',
    logging: false
  }
);

// Definir el modelo Puesto
const Puesto = sequelize.define('Puesto', {
  id_puesto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre_puesto: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'Puesto'
});

async function checkPuestos() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    const puestos = await Puesto.findAll({
      order: [['id_puesto', 'ASC']]
    });

    console.log('Puestos disponibles:');
    puestos.forEach(puesto => {
      console.log(`ID: ${puesto.id_puesto}, Nombre: ${puesto.nombre_puesto}`);
    });

    // Buscar puestos que podrían ser apropiados para admin
    const adminPuestos = puestos.filter(p => 
      p.nombre_puesto.toLowerCase().includes('gerente') ||
      p.nombre_puesto.toLowerCase().includes('director') ||
      p.nombre_puesto.toLowerCase().includes('admin')
    );

    console.log('\nPuestos apropiados para admin:');
    adminPuestos.forEach(puesto => {
      console.log(`ID: ${puesto.id_puesto}, Nombre: ${puesto.nombre_puesto}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkPuestos();