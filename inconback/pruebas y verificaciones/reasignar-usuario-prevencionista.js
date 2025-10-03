const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.CONSTRUAPP_PSQL_BD.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_USER.replace(/"/g, ""),
  process.env.CONSTRUAPP_PSQL_PASSWORD.replace(/"/g, ""),
  {
    host: process.env.CONSTRUAPP_PSQL_HOST.replace(/"/g, ""),
    port: parseInt(process.env.CONSTRUAPP_PSQL_PORT.replace(/"/g, ""), 10),
    dialect: 'postgres',
    logging: false
  }
);

// Definir modelos
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  hashedPassword: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING
}, { tableName: 'user' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const UserRol = sequelize.define('UserRol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { 
  tableName: 'user_rol',
  timestamps: true
});

// Definir asociaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });

async function reasignarUsuarioPrevencionista() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Buscar roles disponibles
    console.log('🔍 Buscando roles disponibles...');
    const supervisorRole = await Rol.findOne({ where: { name: 'supervisor' } });
    const prevencionistaRole = await Rol.findOne({ where: { name: 'prevencionista' } });

    if (!supervisorRole) {
      console.log('❌ Error: No se encontró el rol supervisor');
      return;
    }
    if (!prevencionistaRole) {
      console.log('❌ Error: No se encontró el rol prevencionista');
      return;
    }

    console.log(`✅ Rol supervisor encontrado con ID: ${supervisorRole.id}`);
    console.log(`✅ Rol prevencionista encontrado con ID: ${prevencionistaRole.id}`);

    // Buscar usuarios con rol prevencionista
    const usuariosPrevencionista = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'prevencionista' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📋 Usuarios con rol prevencionista encontrados: ${usuariosPrevencionista.length}`);
    usuariosPrevencionista.forEach((user, index) => {
      console.log(`${index + 1}. ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
    });

    if (usuariosPrevencionista.length === 0) {
      console.log('ℹ️ No hay usuarios con rol prevencionista para reasignar');
      return;
    }

    console.log('\n🔄 Iniciando reasignación de usuarios...');
    
    // Reasignar todos los usuarios prevencionistas a supervisor
    for (const user of usuariosPrevencionista) {
      try {
        // Eliminar la relación actual con prevencionista
        await UserRol.destroy({
          where: {
            userId: user.id,
            rolId: prevencionistaRole.id
          }
        });

        // Crear nueva relación con supervisor
        await UserRol.create({
          userId: user.id,
          rolId: supervisorRole.id
        });

        console.log(`✅ Usuario ${user.names} ${user.apellido_p} reasignado de prevencionista a supervisor`);
      } catch (error) {
        console.log(`❌ Error al reasignar usuario ${user.names} ${user.apellido_p}: ${error.message}`);
      }
    }

    console.log('\n🎉 Proceso de reasignación completado');

    // Verificar usuarios con rol supervisor
    const usuariosSupervisor = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'supervisor' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n✅ Total de usuarios con rol supervisor: ${usuariosSupervisor.length}`);
    usuariosSupervisor.forEach((user, index) => {
      console.log(`${index + 1}. ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
    });

    // Verificar usuarios restantes con rol prevencionista
    const usuariosPrevencionistaRestantes = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'prevencionista' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📊 Usuarios restantes con rol prevencionista: ${usuariosPrevencionistaRestantes.length}`);

  } catch (error) {
    console.error('❌ Error durante la reasignación:', error);
  } finally {
    console.log('🔌 Conexión a la base de datos cerrada');
    await sequelize.close();
  }
}

// Ejecutar la función
reasignarUsuarioPrevencionista();