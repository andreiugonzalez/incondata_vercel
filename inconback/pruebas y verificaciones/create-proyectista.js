const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

// Función para generar URI folder encriptada
function generateEncryptedUriFolder() {
  const randomBytes = crypto.randomBytes(16);
  return randomBytes.toString('hex');
}

// Definir modelos
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
  direccion: DataTypes.STRING,
  rut: DataTypes.STRING,
  codigo_postal: DataTypes.STRING,
  username: DataTypes.STRING,
  urifolder: DataTypes.STRING,
  id_estado_cuenta: DataTypes.INTEGER,
  isTemporaryPassword: DataTypes.BOOLEAN,
  passwordExpirationDate: DataTypes.DATE,
  replacedByUserId: DataTypes.INTEGER
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
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId', as: 'roles' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId', as: 'users' });
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

async function createProyectista() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    const targetRut = '12.345.678-9';
    const password = 'proyectista123';

    console.log(`🔍 Verificando si ya existe un usuario con RUT: ${targetRut}...`);

    // Verificar si ya existe un usuario con este RUT
    const existingUser = await User.findOne({
      where: { rut: targetRut },
      include: [{
        model: Rol,
        as: 'roles',
        through: { attributes: [] }
      }]
    });

    if (existingUser) {
      console.log('👤 Usuario encontrado:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Nombre: ${existingUser.names} ${existingUser.apellido_p} ${existingUser.apellido_m}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - RUT: ${existingUser.rut}`);
      
      if (existingUser.roles && existingUser.roles.length > 0) {
        const roleNames = existingUser.roles.map(role => role.name);
        console.log(`   - Roles: ${roleNames.join(', ')}`);
        
        // Verificar si ya tiene rol proyectista
        const hasProyectistaRole = roleNames.includes('proyectista');
        if (hasProyectistaRole) {
          console.log('✅ El usuario ya tiene rol de proyectista.');
          return;
        } else {
          console.log('🔄 Asignando rol proyectista al usuario existente...');
          
          // Buscar el rol proyectista
          const proyectistaRole = await Rol.findOne({
            where: { name: 'proyectista' }
          });

          if (proyectistaRole) {
            // Verificar si ya existe la relación
            const existingUserRol = await UserRol.findOne({
              where: {
                userId: existingUser.id,
                rolId: proyectistaRole.id
              }
            });

            if (!existingUserRol) {
              await UserRol.create({
                userId: existingUser.id,
                rolId: proyectistaRole.id
              });
              console.log('✅ Rol proyectista asignado correctamente al usuario existente.');
            } else {
              console.log('✅ El usuario ya tenía el rol proyectista asignado.');
            }
          } else {
            console.log('❌ No se encontró el rol proyectista en la base de datos.');
          }
          return;
        }
      }
    }

    console.log('🔄 Creando nuevo usuario proyectista...');

    // Buscar el rol proyectista
    const proyectistaRole = await Rol.findOne({
      where: { name: 'proyectista' }
    });

    if (!proyectistaRole) {
      console.log('❌ Error: No se encontró el rol proyectista en la base de datos.');
      console.log('Los roles disponibles son:');
      const allRoles = await Rol.findAll();
      allRoles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`);
      });
      return;
    }

    console.log(`✅ Rol proyectista encontrado (ID: ${proyectistaRole.id})`);

    // Hashear la contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario con valores mínimos requeridos
    const newUser = await User.create({
      names: 'Proyectista',
      apellido_p: 'Usuario',
      apellido_m: 'Sistema',
      email: 'proyectista@municipalidad.cl',
      hashedPassword: hashedPassword,
      genero: 'Masculino',
      fecha_de_nacimiento: '1985-01-01',
      telefono: '99999999',
      direccion: 'Municipalidad',
      rut: targetRut,
      codigo_postal: '0000000',
      username: 'proyectista',
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

    // Asignar el rol proyectista al usuario
    console.log('🔗 Asignando rol proyectista al usuario...');
    await UserRol.create({
      userId: newUser.id,
      rolId: proyectistaRole.id
    });

    console.log('✅ Rol proyectista asignado correctamente');
    console.log('\n🎉 Usuario proyectista creado y configurado exitosamente');
    console.log('📋 Credenciales:');
    console.log(`   - Usuario: ${newUser.username}`);
    console.log(`   - Contraseña: ${password}`);
    console.log(`   - Email: ${newUser.email}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

createProyectista();