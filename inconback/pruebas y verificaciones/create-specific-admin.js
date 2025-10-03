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

const UserRol = sequelize.define('UserRol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

// Definir asociaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });

async function createSpecificAdminUser() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Datos del usuario específico
    const userData = {
      email: 'adminpro@gmail.com',
      password: 'contra123',
      rut: '12.611.724-8',
      names: 'Admin',
      apellido_p: 'Pro',
      apellido_m: 'User'
    };

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: userData.email },
          { rut: userData.rut }
        ]
      }
    });

    if (existingUser) {
      console.log('Ya existe un usuario con ese email o RUT:', userData.email, userData.rut);
      
      // Verificar si ya tiene rol admin
      const adminRole = await Rol.findOne({ where: { name: 'admin' } });
      if (adminRole) {
        const userRole = await UserRol.findOne({
          where: {
            userId: existingUser.id,
            rolId: adminRole.id
          }
        });
        
        if (userRole) {
          console.log('El usuario ya tiene rol de admin');
        } else {
          // Asignar rol admin al usuario existente
          await UserRol.create({
            userId: existingUser.id,
            rolId: adminRole.id
          });
          console.log('Rol admin asignado al usuario existente');
        }
      }
      
      console.log('Credenciales del usuario existente:');
      console.log('Email:', existingUser.email);
      console.log('RUT:', existingUser.rut);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generar username único basado en el email
    const baseUsername = userData.email.split('@')[0];
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Generar URI folder único
    const generateUriFolder = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    let urifolder = generateUriFolder();
    while (await User.findOne({ where: { urifolder } })) {
      urifolder = generateUriFolder();
    }

    // Crear el nuevo usuario
    const newUser = await User.create({
      names: userData.names,
      apellido_p: userData.apellido_p,
      apellido_m: userData.apellido_m,
      email: userData.email,
      hashedPassword: hashedPassword,
      rut: userData.rut,
      username: username,
      urifolder: urifolder,
      genero: 'Masculino',
      fecha_de_nacimiento: '1990-01-01',
      telefono: '123456789',
      id_cod_telf: 1,
      direccion: 'Dirección por defecto',
      codigo_postal: '12345',
      ID_comuna: 1,
      organizacionid: 1,
      id_puesto: 1, // Gerente General
      puesto: 'admin', // Campo puesto como string
      id_estado_civil: 1,
      id_estado_cuenta: 1,
      id_afp: 1,
      id_salud: 1,
      isTemporaryPassword: false
    });

    console.log('Usuario creado exitosamente:', newUser.id);

    // Buscar el rol 'admin'
    const adminRole = await Rol.findOne({ where: { name: 'admin' } });
    
    if (!adminRole) {
      console.log('Rol admin no encontrado. Creando rol admin...');
      const newAdminRole = await Rol.create({ name: 'admin' });
      
      // Asignar el rol al usuario
      await UserRol.create({
        user_id: newUser.id,
        rol_id: newAdminRole.id
      });
    } else {
      // Asignar el rol admin al usuario
      await UserRol.create({
        userId: newUser.id,
        rolId: adminRole.id
      });
    }

    console.log('Rol admin asignado correctamente');
    console.log('\n=== CREDENCIALES DEL NUEVO USUARIO ADMIN ===');
    console.log('Email:', userData.email);
    console.log('Contraseña:', userData.password);
    console.log('RUT:', userData.rut);
    console.log('Username:', username);
    console.log('===========================================');

  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la función
createSpecificAdminUser();