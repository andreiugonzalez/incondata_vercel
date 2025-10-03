const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar Sequelize y configurar la conexión manualmente
const { Sequelize, DataTypes, Op } = require('sequelize');

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

async function createAdminUser() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const targetRut = '14.735.788-5';
    const targetEmail = 'admin1@gmail.com';
    
    // Verificar si ya existe un usuario con este RUT o email
    console.log(`🔍 Verificando si existe usuario con RUT: ${targetRut} o email: ${targetEmail}`);
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { rut: targetRut },
          { email: targetEmail }
        ]
      }
    });

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con este RUT o email:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Nombre: ${existingUser.names} ${existingUser.apellido_p} ${existingUser.apellido_m}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - RUT: ${existingUser.rut}`);
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
        
        // Verificar si ya tiene rol admin
        const hasAdminRole = roleNames.includes('admin');
        if (hasAdminRole) {
          console.log('✅ El usuario ya tiene rol de admin.');
          return;
        } else {
          console.log('🔄 Asignando rol admin al usuario existente...');
          
          // Buscar el rol admin
          const adminRole = await Rol.findOne({
            where: { name: 'admin' }
          });

          if (adminRole) {
            // Verificar si ya existe la relación
            const existingUserRol = await UserRol.findOne({
              where: {
                userId: existingUser.id,
                rolId: adminRole.id
              }
            });

            if (!existingUserRol) {
              await UserRol.create({
                userId: existingUser.id,
                rolId: adminRole.id
              });
              console.log('✅ Rol admin asignado correctamente al usuario existente.');
            } else {
              console.log('✅ El usuario ya tenía el rol admin asignado.');
            }
          } else {
            console.log('❌ No se encontró el rol admin en la base de datos.');
          }
          return;
        }
      }
    }

    console.log('🔄 Creando nuevo usuario admin...');

    // Buscar el rol admin
    const adminRole = await Rol.findOne({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('❌ Error: No se encontró el rol admin en la base de datos.');
      console.log('💡 Asegúrate de que los seeders de roles se hayan ejecutado correctamente.');
      return;
    }

    // Generar contraseña hasheada
    const password = 'admin123';
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

    // Generar username único basado en el email
    const username = targetEmail.split('@')[0] + '_admin';

    // Crear el usuario con los datos especificados
    const newUser = await User.create({
      names: 'Admin',
      apellido_p: 'Usuario',
      apellido_m: 'Sistema',
      email: targetEmail,
      hashedPassword: hashedPassword,
      genero: 'Masculino',
      fecha_de_nacimiento: '1990-01-01',
      telefono: '99999999',
      direccion: 'Dirección Admin',
      rut: targetRut,
      codigo_postal: '0000000',
      username: username,
      urifolder: generateEncryptedUriFolder(),
      organizacionid: 2, // Codelco La Serena - organización existente
      id_puesto: 1, // Puesto por defecto
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

    // Asignar rol admin
    await UserRol.create({
      userId: newUser.id,
      rolId: adminRole.id
    });

    console.log('✅ Rol admin asignado correctamente.');
    console.log('');
    console.log('🔑 CREDENCIALES DEL USUARIO ADMIN:');
    console.log('=====================================');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${targetEmail}`);
    console.log(`   Password: ${password}`);
    console.log(`   RUT: ${targetRut}`);
    console.log('=====================================');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
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
createAdminUser();