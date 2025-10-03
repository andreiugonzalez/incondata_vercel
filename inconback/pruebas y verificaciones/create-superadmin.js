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

async function createSuperAdminUser() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const targetRut = '22.729.888-K';
    
    // Verificar si ya existe un usuario con este RUT
    console.log(`🔍 Verificando si existe usuario con RUT: ${targetRut}`);
    const existingUser = await User.findOne({
      where: { rut: targetRut }
    });

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con este RUT:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Nombre: ${existingUser.names} ${existingUser.apellido_p} ${existingUser.apellido_m}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Username: ${existingUser.username}`);
      
      // Verificar roles del usuario existente
      const userRoles = await UserRol.findAll({
        where: { userId: existingUser.id },
        include: [{
          model: Rol,
          attributes: ['name']
        }]
      });
      
      if (userRoles && userRoles.length > 0) {
        const roleNames = userRoles.map(ur => ur.Rol ? ur.Rol.name : 'Unknown');
        console.log(`   - Roles: ${roleNames.join(', ')}`);
        
        // Verificar si ya tiene rol superadmin
        const hasSuperAdminRole = roleNames.includes('superadmin');
        if (hasSuperAdminRole) {
          console.log('✅ El usuario ya tiene rol de superadmin.');
          return;
        } else {
          console.log('🔄 Asignando rol superadmin al usuario existente...');
          
          // Buscar el rol superadmin
          const superAdminRole = await Rol.findOne({
            where: { name: 'superadmin' }
          });

          if (superAdminRole) {
            // Verificar si ya existe la relación
            const existingUserRol = await UserRol.findOne({
              where: {
                userId: existingUser.id,
                rolId: superAdminRole.id
              }
            });

            if (!existingUserRol) {
              await UserRol.create({
                userId: existingUser.id,
                rolId: superAdminRole.id
              });
              console.log('✅ Rol superadmin asignado correctamente al usuario existente.');
            } else {
              console.log('✅ El usuario ya tenía el rol superadmin asignado.');
            }
          } else {
            console.log('❌ No se encontró el rol superadmin en la base de datos.');
          }
          return;
        }
      }
    }

    console.log('🔄 Creando nuevo usuario superadmin...');

    // Buscar el rol superadmin
    const superAdminRole = await Rol.findOne({
      where: { name: 'superadmin' }
    });

    if (!superAdminRole) {
      console.log('❌ Error: No se encontró el rol superadmin en la base de datos.');
      console.log('💡 Asegúrate de que los seeders de roles se hayan ejecutado correctamente.');
      return;
    }

    // Usar valores por defecto simples para evitar dependencias
    const defaultValues = {
      comuna: 1,
      afp: 1,
      salud: 1,
      organizacion: 1,
      puesto: 1,
      estadoCivil: 1,
      codTelefono: 1
    };

    // Generar contraseña hasheada
    const password = 'SuperAdmin2024!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar URI folder único
    function generateEncryptedUriFolder() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    // Crear el usuario con valores mínimos requeridos
    const newUser = await User.create({
      names: 'Super',
      apellido_p: 'Admin',
      apellido_m: 'Sistema',
      email: 'superadmin@sistema.interno',
      hashedPassword: hashedPassword,
      genero: 'Masculino',
      fecha_de_nacimiento: '1990-01-01',
      telefono: '99999999',
      direccion: 'Sistema Interno',
      rut: targetRut,
      codigo_postal: '0000000',
      username: 'superadmin',
      urifolder: generateEncryptedUriFolder(),
      id_estado_cuenta: 1, // Activo
      isTemporaryPassword: false,
      passwordExpirationDate: null
      // Omitimos campos con claves foráneas que podrían no existir
    });

    console.log('✅ Usuario creado exitosamente:');
    console.log(`   - ID: ${newUser.id}`);
    console.log(`   - RUT: ${newUser.rut}`);
    console.log(`   - Nombre: ${newUser.names} ${newUser.apellido_p} ${newUser.apellido_m}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Username: ${newUser.username}`);

    // Asignar rol superadmin
    await UserRol.create({
      userId: newUser.id,
      rolId: superAdminRole.id
    });

    console.log('✅ Rol superadmin asignado correctamente.');
    console.log('');
    console.log('🔑 CREDENCIALES DEL USUARIO SUPERADMIN:');
    console.log('=====================================');
    console.log(`   Username: superadmin`);
    console.log(`   Email: superadmin@sistema.interno`);
    console.log(`   Password: ${password}`);
    console.log(`   RUT: ${targetRut}`);
    console.log('=====================================');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.');
    console.log('💡 Se recomienda cambiar la contraseña después del primer login.');

  } catch (error) {
    console.error('❌ Error al crear usuario superadmin:', error);
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
createSuperAdminUser();