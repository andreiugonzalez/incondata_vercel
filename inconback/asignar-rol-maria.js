const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('incondata_demo', 'usr_prac2025', 'Usr*2025.', {
  host: '52.22.171.179',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Definir modelos
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING
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

// Definir asociaciones
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

async function asignarRolMaria() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    // Buscar a María Rodríguez
    const maria = await User.findOne({
      where: { email: 'maria.rodriguez@incondata.cl' }
    });
    
    if (!maria) {
      console.log('❌ No se encontró a María Rodríguez');
      return;
    }
    
    console.log(`✅ María Rodríguez encontrada - ID: ${maria.id}`);
    
    // Buscar el rol de admin
    const rolAdmin = await Rol.findOne({
      where: { name: 'admin' }
    });
    
    if (!rolAdmin) {
      console.log('❌ No se encontró el rol admin');
      return;
    }
    
    console.log(`✅ Rol admin encontrado - ID: ${rolAdmin.id}`);
    
    // Verificar si ya tiene el rol asignado
    const rolExistente = await UserRol.findOne({
      where: {
        userId: maria.id,
        rolId: rolAdmin.id
      }
    });
    
    if (rolExistente) {
      console.log('⚠️ María Rodríguez ya tiene el rol admin asignado');
      return;
    }
    
    // Asignar el rol
    const nuevoUserRol = await UserRol.create({
      userId: maria.id,
      rolId: rolAdmin.id
    });
    
    console.log(`🎉 ¡Rol admin asignado exitosamente a María Rodríguez!`);
    console.log(`📋 UserRol creado con ID: ${nuevoUserRol.id}`);
    
  } catch (error) {
    console.error('❌ Error al asignar rol:', error);
  } finally {
    process.exit(0);
  }
}

asignarRolMaria();