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

async function asignarRolCarlos() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');
    
    // Buscar el usuario Carlos González
    console.log('👤 Buscando usuario Carlos González...');
    const carlosUser = await User.findOne({
      where: { email: 'carlos.gonzalez@incondata.cl' }
    });
    
    if (!carlosUser) {
      console.log('❌ Usuario Carlos González no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${carlosUser.names} ${carlosUser.apellido_p} (ID: ${carlosUser.id})`);
    
    // Buscar el rol de superintendente
    console.log('\n🎭 Buscando rol de superintendente...');
    const superintendenteRol = await Rol.findOne({
      where: { name: 'superintendente' }
    });
    
    if (!superintendenteRol) {
      console.log('❌ Rol de superintendente no encontrado');
      return;
    }
    
    console.log(`✅ Rol encontrado: ${superintendenteRol.name} (ID: ${superintendenteRol.id})`);
    
    // Verificar si ya tiene el rol asignado
    console.log('\n🔍 Verificando si ya tiene el rol asignado...');
    const existingUserRol = await UserRol.findOne({
      where: {
        userId: carlosUser.id,
        rolId: superintendenteRol.id
      }
    });
    
    if (existingUserRol) {
      console.log('⚠️ El usuario ya tiene el rol de superintendente asignado');
      return;
    }
    
    // Asignar el rol
    console.log('\n➕ Asignando rol de superintendente a Carlos González...');
    const newUserRol = await UserRol.create({
      userId: carlosUser.id,
      rolId: superintendenteRol.id
    });
    
    console.log(`✅ Rol asignado exitosamente!`);
    console.log(`   - Usuario: ${carlosUser.names} ${carlosUser.apellido_p}`);
    console.log(`   - Email: ${carlosUser.email}`);
    console.log(`   - Rol: ${superintendenteRol.name}`);
    console.log(`   - Registro ID: ${newUserRol.id}`);
    
    // Verificar la asignación
    console.log('\n🔍 Verificando la asignación...');
    const verification = await UserRol.findOne({
      where: {
        userId: carlosUser.id,
        rolId: superintendenteRol.id
      },
      include: [
        {
          model: User,
          attributes: ['names', 'apellido_p', 'email']
        },
        {
          model: Rol,
          attributes: ['name']
        }
      ]
    });
    
    if (verification) {
      console.log('✅ Verificación exitosa - El rol ha sido asignado correctamente');
      console.log(`   Usuario: ${verification.User.names} ${verification.User.apellido_p}`);
      console.log(`   Email: ${verification.User.email}`);
      console.log(`   Rol: ${verification.Rol.name}`);
    } else {
      console.log('❌ Error en la verificación - El rol no se asignó correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error al asignar rol:', error.message);
    console.error('Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

asignarRolCarlos();