const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ''),
  process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ''),
  process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ''),
  {
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ''),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ''), 10),
    dialect: 'postgres',
    logging: false,
  }
);

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  hashedPassword: DataTypes.STRING,
  username: DataTypes.STRING,
  organizacionid: DataTypes.INTEGER,
  id_puesto: DataTypes.INTEGER,
}, { tableName: 'user' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const UserRol = sequelize.define('user_rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Buscar por ambos emails posibles
    let user = await User.findOne({
      where: { email: 'superadmin2@gmail.com' },
      include: [{
        model: Rol,
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      user = await User.findOne({
        where: { email: 'superadmin2@sistema.com' },
        include: [{
          model: Rol,
          through: { attributes: [] }
        }]
      });
    }
    
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('ID:', user.id);
      console.log('Nombre:', user.names, user.apellido_p, user.apellido_m);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Organización ID:', user.organizacionid);
      console.log('Puesto ID:', user.id_puesto);
      console.log('Roles:', user.Rols ? user.Rols.map(r => r.name).join(', ') : 'Sin roles');
    } else {
      console.log('❌ No se encontró usuario con ninguno de los emails');
      
      // Buscar usuarios con superadmin2 en el username
      const userByUsername = await User.findOne({
        where: { username: 'superadmin2' },
        include: [{
          model: Rol,
          through: { attributes: [] }
        }]
      });
      
      if (userByUsername) {
        console.log('\n🔍 Usuario encontrado por username:');
        console.log('ID:', userByUsername.id);
        console.log('Email:', userByUsername.email);
        console.log('Username:', userByUsername.username);
        console.log('Roles:', userByUsername.Rols ? userByUsername.Rols.map(r => r.name).join(', ') : 'Sin roles');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUser();