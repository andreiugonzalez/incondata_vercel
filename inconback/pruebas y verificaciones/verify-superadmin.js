const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD,
  process.env.CONSTRUAPP_PSQL_USER,
  process.env.CONSTRUAPP_PSQL_PASSWORD,
  {
    host: process.env.CONSTRUAPP_PSQL_HOST,
    port: process.env.CONSTRUAPP_PSQL_PORT,
    dialect: 'postgres',
    logging: false
  }
);

// Definir modelos básicos
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  hashedPassword: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING,
  id_estado_cuenta: DataTypes.INTEGER
}, { tableName: 'user' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const UserRol = sequelize.define('user_rol', {
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

// Definir asociaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

async function verifySuperAdmin() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    const targetRut = '22.729.888-K';
    
    console.log(`\n🔍 Buscando usuario con RUT: ${targetRut}`);
    
    // Buscar el usuario
    const user = await User.findOne({
      where: { rut: targetRut }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario superadmin.');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - RUT: ${user.rut}`);
    console.log(`   - Estado cuenta: ${user.id_estado_cuenta}`);

    // Verificar roles
    console.log('\n🔍 Verificando roles del usuario...');
    const userRoles = await UserRol.findAll({
      where: { userId: user.id },
      include: [{
        model: Rol,
        attributes: ['id', 'name']
      }]
    });

    if (userRoles && userRoles.length > 0) {
      console.log('✅ Roles asignados:');
      userRoles.forEach(ur => {
        if (ur.Rol) {
          console.log(`   - ${ur.Rol.name} (ID: ${ur.Rol.id})`);
        }
      });
    } else {
      console.log('❌ No se encontraron roles asignados al usuario.');
    }

    // Verificar contraseña
    console.log('\n🔍 Verificando contraseña...');
    const testPassword = 'SuperAdmin2024!';
    const isPasswordValid = await bcrypt.compare(testPassword, user.hashedPassword);
    
    if (isPasswordValid) {
      console.log('✅ La contraseña es válida.');
    } else {
      console.log('❌ La contraseña no es válida.');
    }

    // Verificar estado de cuenta
    console.log('\n🔍 Verificando estado de cuenta...');
    if (user.id_estado_cuenta === 1) {
      console.log('✅ La cuenta está activa.');
    } else {
      console.log(`⚠️  La cuenta no está activa. Estado: ${user.id_estado_cuenta}`);
    }

    console.log('\n📋 RESUMEN DE CREDENCIALES:');
    console.log('=====================================');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${testPassword}`);
    console.log(`RUT: ${user.rut}`);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada.');
  }
}

verifySuperAdmin();