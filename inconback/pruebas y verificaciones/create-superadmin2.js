const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar Sequelize y configurar la conexión manualmente
const { Sequelize, DataTypes } = require('sequelize');

// Crear conexión a la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
  {
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: 'postgres',
    logging: false, // Desactivar logs de SQL
  }
);

// Definir modelos básicos necesarios
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  hashedPassword: DataTypes.STRING,
  genero: DataTypes.STRING,
  fecha_de_nacimiento: DataTypes.DATE,
  telefono: DataTypes.STRING,
  id_cod_telf: DataTypes.INTEGER,
  direccion: DataTypes.STRING,
  rut: DataTypes.STRING,
  codigo_postal: DataTypes.STRING,
  ID_comuna: DataTypes.INTEGER,
  username: DataTypes.STRING,
  organizacionid: DataTypes.INTEGER,
  id_puesto: DataTypes.INTEGER,
  urifolder: DataTypes.STRING,
  id_estado_civil: DataTypes.INTEGER,
  id_estado_cuenta: DataTypes.INTEGER,
  id_afp: DataTypes.INTEGER,
  id_salud: DataTypes.INTEGER,
  isTemporaryPassword: DataTypes.BOOLEAN,
  passwordExpirationDate: DataTypes.DATE
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
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

async function createSuperAdmin2User() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const targetRut = '18.640.663-K';
    const targetUsername = 'superadmin2';
    const targetEmail = 'superadmin2@sistema.com';
    const targetPassword = 'super123';
    
    // Verificar si ya existe un usuario con este RUT
    console.log(`🔍 Verificando si existe usuario con RUT: ${targetRut}`);
    const existingUserByRut = await User.findOne({
      where: { rut: targetRut }
    });

    if (existingUserByRut) {
      console.log('⚠️  Ya existe un usuario con este RUT:');
      console.log(`   - ID: ${existingUserByRut.id}`);
      console.log(`   - Nombre: ${existingUserByRut.names} ${existingUserByRut.apellido_p} ${existingUserByRut.apellido_m}`);
      console.log(`   - Email: ${existingUserByRut.email}`);
      console.log(`   - Username: ${existingUserByRut.username}`);
      return;
    }

    // Verificar si ya existe un usuario con este username
    console.log(`🔍 Verificando si existe usuario con username: ${targetUsername}`);
    const existingUserByUsername = await User.findOne({
      where: { username: targetUsername }
    });

    if (existingUserByUsername) {
      console.log('⚠️  Ya existe un usuario con este username:');
      console.log(`   - ID: ${existingUserByUsername.id}`);
      console.log(`   - RUT: ${existingUserByUsername.rut}`);
      console.log(`   - Email: ${existingUserByUsername.email}`);
      return;
    }

    // Verificar si ya existe un usuario con este email
    console.log(`🔍 Verificando si existe usuario con email: ${targetEmail}`);
    const existingUserByEmail = await User.findOne({
      where: { email: targetEmail }
    });

    if (existingUserByEmail) {
      console.log('⚠️  Ya existe un usuario con este email:');
      console.log(`   - ID: ${existingUserByEmail.id}`);
      console.log(`   - RUT: ${existingUserByEmail.rut}`);
      console.log(`   - Username: ${existingUserByEmail.username}`);
      return;
    }

    console.log('🔄 Creando nuevo usuario superadmin2...');

    // Buscar el rol superadmin
    const superAdminRole = await Rol.findOne({
      where: { name: 'superadmin' }
    });

    if (!superAdminRole) {
      console.log('❌ Error: No se encontró el rol superadmin en la base de datos.');
      console.log('💡 Asegúrate de que los seeders de roles se hayan ejecutado correctamente.');
      return;
    }

    console.log(`✅ Rol superadmin encontrado con ID: ${superAdminRole.id}`);

    // Generar contraseña hasheada
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    // Generar URI folder único
    function generateEncryptedUriFolder() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    // Crear el usuario con los datos especificados
    const newUser = await User.create({
      names: 'Super',
      apellido_p: 'Admin',
      apellido_m: '2',
      email: targetEmail,
      hashedPassword: hashedPassword,
      genero: 'Masculino',
      fecha_de_nacimiento: '1990-01-01',
      telefono: '99999999',
      direccion: 'Sistema Interno',
      rut: targetRut,
      codigo_postal: '0000000',
      username: targetUsername,
      urifolder: generateEncryptedUriFolder(),
      id_estado_cuenta: 1, // Activo
      isTemporaryPassword: false,
      passwordExpirationDate: null
    });

    console.log('✅ Usuario creado exitosamente:');
    console.log(`   - ID: ${newUser.id}`);
    console.log(`   - RUT: ${newUser.rut}`);
    console.log(`   - Nombre: ${newUser.names} ${newUser.apellido_p} ${newUser.apellido_m}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Username: ${newUser.username}`);

    // Asignar rol superadmin
    const userRol = await UserRol.create({
      userId: newUser.id,
      rolId: superAdminRole.id
    });

    console.log('✅ Rol superadmin asignado correctamente.');
    console.log(`   - UserRol ID: ${userRol.id}`);
    console.log(`   - User ID: ${userRol.userId}`);
    console.log(`   - Rol ID: ${userRol.rolId}`);
    
    console.log('');
    console.log('🔑 CREDENCIALES DEL USUARIO SUPERADMIN2:');
    console.log('========================================');
    console.log(`   RUT: ${targetRut}`);
    console.log(`   Username: ${targetUsername}`);
    console.log(`   Email: ${targetEmail}`);
    console.log(`   Password: ${targetPassword}`);
    console.log('========================================');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.');
    console.log('💡 Se recomienda cambiar la contraseña después del primer login.');

  } catch (error) {
    console.error('❌ Error al crear usuario superadmin2:', error);
    if (error.name === 'SequelizeValidationError') {
      console.log('Errores de validación:');
      error.errors.forEach(err => {
        console.log(`   - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar el script
createSuperAdmin2User();