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
  genero: DataTypes.ENUM('Femenino', 'Masculino'),
  fecha_de_nacimiento: DataTypes.DATEONLY,
  telefono: DataTypes.INTEGER,
  direccion: DataTypes.STRING,
  codigo_postal: DataTypes.INTEGER,
  urifolder: DataTypes.STRING,
  id_estado_cuenta: DataTypes.INTEGER,
  ID_comuna: DataTypes.INTEGER,
  id_salud: DataTypes.INTEGER,
  id_estado_civil: DataTypes.INTEGER,
  id_cod_telf: DataTypes.INTEGER,
  id_afp: DataTypes.INTEGER,
  id_grupo: DataTypes.INTEGER,
  id_puesto: DataTypes.INTEGER,
  organizacionid: DataTypes.INTEGER,
  puesto: DataTypes.STRING,
  ultimo_acceso: DataTypes.DATEONLY,
  passwordExpirationDate: DataTypes.DATE,
  isTemporaryPassword: DataTypes.BOOLEAN,
  storage_limit: DataTypes.BIGINT,
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
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

// Función para generar URI folder encriptada
function generateEncryptedUriFolder() {
  const randomString = crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(randomString).digest('hex');
}

async function createSuperintendenteUser() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const targetRut = '10.923.534-2';
    const password = 'intendente123';
    
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
        
        // Verificar si ya tiene rol superintendente
        const hasSuperintendenteRole = roleNames.includes('superintendente');
        if (hasSuperintendenteRole) {
          console.log('✅ El usuario ya tiene rol de superintendente.');
          return;
        } else {
          console.log('🔄 Asignando rol superintendente al usuario existente...');
          
          // Buscar el rol superintendente
          const superintendenteRole = await Rol.findOne({
            where: { name: 'superintendente' }
          });

          if (superintendenteRole) {
            // Verificar si ya existe la relación
            const existingUserRol = await UserRol.findOne({
              where: {
                userId: existingUser.id,
                rolId: superintendenteRole.id
              }
            });

            if (!existingUserRol) {
              await UserRol.create({
                userId: existingUser.id,
                rolId: superintendenteRole.id
              });
              console.log('✅ Rol superintendente asignado correctamente al usuario existente.');
            } else {
              console.log('✅ El usuario ya tenía el rol superintendente asignado.');
            }
          } else {
            console.log('❌ No se encontró el rol superintendente en la base de datos.');
          }
          return;
        }
      }
    }

    console.log('🔄 Creando nuevo usuario superintendente...');

    // Buscar el rol superintendente
    const superintendenteRole = await Rol.findOne({
      where: { name: 'superintendente' }
    });

    if (!superintendenteRole) {
      console.log('❌ Error: No se encontró el rol superintendente en la base de datos.');
      console.log('Los roles disponibles son:');
      const allRoles = await Rol.findAll();
      allRoles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`);
      });
      return;
    }

    console.log(`✅ Rol superintendente encontrado (ID: ${superintendenteRole.id})`);

    // Hashear la contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario con valores mínimos requeridos
    const newUser = await User.create({
      names: 'Superintendente',
      apellido_p: 'Usuario',
      apellido_m: 'Sistema',
      email: 'superintendente@sistema.com',
      hashedPassword: hashedPassword,
      genero: 'Masculino',
      fecha_de_nacimiento: '1985-01-01',
      telefono: '99999999',
      direccion: 'Oficina Central',
      rut: targetRut,
      codigo_postal: '0000000',
      username: 'superintendente',
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

    // Asignar rol superintendente
    await UserRol.create({
      userId: newUser.id,
      rolId: superintendenteRole.id
    });

    console.log('✅ Rol superintendente asignado correctamente.');
    console.log('');
    console.log('🔑 CREDENCIALES DEL USUARIO SUPERINTENDENTE:');
    console.log('==========================================');
    console.log(`   RUT: ${targetRut}`);
    console.log(`   Username: superintendente`);
    console.log(`   Email: superintendente@sistema.com`);
    console.log(`   Password: ${password}`);
    console.log('==========================================');
    console.log('');
    console.log('✅ Usuario superintendente creado y configurado correctamente.');

  } catch (error) {
    console.error('❌ Error al crear usuario superintendente:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la función
createSuperintendenteUser();