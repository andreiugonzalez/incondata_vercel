const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

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
  names: { type: DataTypes.STRING, allowNull: false },
  apellido_p: { type: DataTypes.STRING, allowNull: false },
  apellido_m: { type: DataTypes.STRING, allowNull: false },
  hashedPassword: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  genero: { type: DataTypes.ENUM('Femenino', 'Masculino'), allowNull: false },
  fecha_de_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
  telefono: { type: DataTypes.INTEGER, allowNull: false },
  direccion: { type: DataTypes.STRING, allowNull: false },
  codigo_postal: { type: DataTypes.INTEGER, allowNull: false },
  rut: { type: DataTypes.STRING, allowNull: false },
  organizacionid: DataTypes.INTEGER,
  username: DataTypes.STRING,
  puesto: DataTypes.STRING,
  ultimo_acceso: DataTypes.DATEONLY,
  ID_comuna: DataTypes.INTEGER,
  id_salud: DataTypes.INTEGER,
  id_estado_cuenta: DataTypes.INTEGER,
  id_estado_civil: DataTypes.INTEGER,
  id_cod_telf: DataTypes.INTEGER,
  id_afp: DataTypes.INTEGER,
  id_grupo: DataTypes.INTEGER,
  id_puesto: DataTypes.INTEGER,
  urifolder: DataTypes.STRING,
  storage_limit: DataTypes.BIGINT,
  replacedByUserId: DataTypes.INTEGER
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
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });
User.hasMany(UserRol, { foreignKey: 'userId' });
Rol.hasMany(UserRol, { foreignKey: 'rolId' });

// Datos de usuarios con todos los campos requeridos
const usersData = [
  {
    role: 'inspector',
    rut: '90123456-7',
    names: 'Diego',
    apellido_p: 'Muñoz',
    apellido_m: 'Pinto',
    email: 'diego.munoz@incondata.cl',
    password: 'Inspector2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1984-01-19',
    telefono: 912345009,
    direccion: 'Av. La Florida 987, La Florida',
    codigo_postal: 8240000,
    puesto: 'Inspector de Calidad',
    username: 'dmunoz',
    organizacionid: 1,
    ID_comuna: 9,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 9
  },
  {
    role: 'planner',
    rut: '89012345-6',
    names: 'Carmen',
    apellido_p: 'Jiménez',
    apellido_m: 'Rojas',
    email: 'carmen.jimenez@incondata.cl',
    password: 'Planner2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1986-08-27',
    telefono: 912345008,
    direccion: 'Calle Peñalolén 654, Peñalolén',
    codigo_postal: 7910000,
    puesto: 'Planificador de Proyectos',
    username: 'cjimenez',
    organizacionid: 1,
    ID_comuna: 8,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 8
  },
  {
    role: 'prevencionista',
    rut: '78901234-5',
    names: 'Sofía',
    apellido_p: 'Herrera',
    apellido_m: 'Vega',
    email: 'sofia.herrera@incondata.cl',
    password: 'Prevencionista2024!',
    genero: 'Femenino',
    fecha_de_nacimiento: '1987-12-03',
    telefono: 912345007,
    direccion: 'Calle Maipú 321, Maipú',
    codigo_postal: 9250000,
    puesto: 'Prevencionista de Riesgos',
    username: 'sherrera',
    organizacionid: 1,
    ID_comuna: 7,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 7
  },
  {
    role: 'administrador de contrato',
    rut: '67890123-4',
    names: 'Roberto',
    apellido_p: 'Silva',
    apellido_m: 'Mendoza',
    email: 'roberto.silva@incondata.cl',
    password: 'AdminContrato2024!',
    genero: 'Masculino',
    fecha_de_nacimiento: '1980-06-14',
    telefono: 912345006,
    direccion: 'Av. Providencia 456, Providencia',
    codigo_postal: 7500000,
    puesto: 'Administrador de Contrato',
    username: 'rsilva',
    organizacionid: 1,
    ID_comuna: 6,
    id_salud: 1,
    id_estado_cuenta: 1,
    id_estado_civil: 1,
    id_cod_telf: 56,
    id_afp: 1,
    id_grupo: 1,
    id_puesto: 6
  }
];

async function createUsersWithRoles() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    for (const userData of usersData) {
      console.log(`\n🔄 Procesando usuario con rol: ${userData.role}`);

      // Verificar si el rol existe
      const role = await Rol.findOne({ where: { name: userData.role } });
      if (!role) {
        console.log(`❌ El rol '${userData.role}' no existe en la base de datos.`);
        continue;
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ 
        where: { 
          [Sequelize.Op.or]: [
            { email: userData.email },
            { rut: userData.rut },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️  Usuario ya existe: ${userData.email} (ID: ${existingUser.id})`);
        
        // Verificar si ya tiene el rol asignado
        const existingUserRole = await UserRol.findOne({
          where: { userId: existingUser.id, rolId: role.id }
        });

        if (!existingUserRole) {
          // Asignar el rol al usuario existente
          await UserRol.create({
            userId: existingUser.id,
            rolId: role.id
          });
          console.log(`✅ Rol '${userData.role}' asignado al usuario existente: ${userData.email}`);
        } else {
          console.log(`ℹ️  Usuario ya tiene el rol '${userData.role}' asignado.`);
        }
        continue;
      }

      // Crear hash de la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear el usuario con todos los campos requeridos
      const newUser = await User.create({
        names: userData.names,
        apellido_p: userData.apellido_p,
        apellido_m: userData.apellido_m,
        hashedPassword: hashedPassword,
        email: userData.email,
        genero: userData.genero,
        fecha_de_nacimiento: userData.fecha_de_nacimiento,
        telefono: userData.telefono,
        direccion: userData.direccion,
        codigo_postal: userData.codigo_postal,
        rut: userData.rut,
        organizacionid: userData.organizacionid,
        username: userData.username,
        puesto: userData.puesto,
        ID_comuna: userData.ID_comuna,
        id_salud: userData.id_salud,
        id_estado_cuenta: userData.id_estado_cuenta,
        id_estado_civil: userData.id_estado_civil,
        id_cod_telf: userData.id_cod_telf,
        id_afp: userData.id_afp,
        id_grupo: userData.id_grupo,
        id_puesto: userData.id_puesto,
        urifolder: `encrypted_folder_${userData.rut.replace('-', '_')}`,
        storage_limit: 10737418240 // 10 GB en bytes
      });

      console.log(`✅ Usuario creado: ${newUser.email} (ID: ${newUser.id})`);

      // Asignar el rol al usuario
      await UserRol.create({
        userId: newUser.id,
        rolId: role.id
      });

      console.log(`✅ Rol '${userData.role}' asignado al usuario: ${newUser.email}`);
    }

    // Verificar los usuarios creados con sus roles
    console.log('\n📋 Verificando usuarios con roles específicos:');
    const targetRoles = ['inspector', 'planner', 'prevencionista', 'administrador de contrato'];
    
    for (const roleName of targetRoles) {
      const role = await Rol.findOne({ where: { name: roleName } });
      if (role) {
        const userRoles = await UserRol.findAll({
          where: { rolId: role.id },
          include: [
            {
              model: User,
              attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'username']
            }
          ]
        });

        console.log(`\n👤 Usuarios con rol '${roleName}' (${userRoles.length}):`);
        userRoles.forEach(userRole => {
          const user = userRole.User;
          console.log(`  - ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email}) - ID: ${user.id}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

createUsersWithRoles();