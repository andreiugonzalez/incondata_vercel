require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  username: process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ''),
  password: process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ''),
  database: process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ''),
  host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ''),
  port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ''), 10),
  dialect: 'postgres',
  logging: false
});

// Define models
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  email: DataTypes.STRING
}, { tableName: 'user' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const UserRol = sequelize.define('UserRol', {
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

// Define associations
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });

async function checkSuperadmin() {
  try {
    // First, let's see all users
    console.log('All users in database:');
    const allUsers = await User.findAll({
      include: [{ model: Rol }]
    });
    
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.names}, Roles: ${user.Rols.map(r => r.name).join(', ')}`);
    });
    
    // Now look for superadmin specifically
    const superadminUsers = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'superadmin' }
      }]
    });
    
    console.log('\nUsers with superadmin role:');
    superadminUsers.forEach(user => {
      console.log(`User: ${user.names}, All roles: ${user.Rols.map(r => r.name).join(', ')}`);
      console.log(`First role: ${user.Rols[0]?.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSuperadmin();