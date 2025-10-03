const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Crear conexión a la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
  {
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: 'postgres',
    logging: false,
  }
);

// Definir modelo User
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  rut: DataTypes.STRING,
  puesto: DataTypes.STRING,
  id_puesto: DataTypes.INTEGER
}, { tableName: 'user' });

async function updateUserPuesto() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Buscar el usuario admin
    const adminUser = await User.findOne({
      where: { email: 'adminpro@gmail.com' }
    });

    if (!adminUser) {
      console.log('Usuario admin no encontrado');
      return;
    }

    console.log('Usuario encontrado:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Puesto actual: ${adminUser.puesto}`);
    console.log(`ID Puesto actual: ${adminUser.id_puesto}`);

    // Actualizar el campo puesto
    await adminUser.update({
      puesto: 'admin'
    });

    console.log('Campo puesto actualizado a "admin"');

    // Verificar la actualización
    const updatedUser = await User.findOne({
      where: { email: 'adminpro@gmail.com' }
    });

    console.log('Usuario después de la actualización:');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Puesto: ${updatedUser.puesto}`);
    console.log(`ID Puesto: ${updatedUser.id_puesto}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateUserPuesto();