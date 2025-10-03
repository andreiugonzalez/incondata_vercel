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

async function reasignarUsuariosPlanner() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Buscar roles disponibles
    console.log('🔍 Buscando roles disponibles...');
    const adminRole = await Rol.findOne({ where: { name: 'admin' } });
    const supervisorRole = await Rol.findOne({ where: { name: 'supervisor' } });
    const plannerRole = await Rol.findOne({ where: { name: 'planner' } });

    if (!adminRole) {
      console.log('❌ Error: No se encontró el rol admin');
      return;
    }
    if (!supervisorRole) {
      console.log('❌ Error: No se encontró el rol supervisor');
      return;
    }
    if (!plannerRole) {
      console.log('❌ Error: No se encontró el rol planner');
      return;
    }

    console.log(`✅ Rol admin encontrado con ID: ${adminRole.id}`);
    console.log(`✅ Rol supervisor encontrado con ID: ${supervisorRole.id}`);
    console.log(`✅ Rol planner encontrado con ID: ${plannerRole.id}`);

    // Buscar usuarios con rol planner
    const usuariosPlanner = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'planner' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📋 Usuarios con rol planner encontrados: ${usuariosPlanner.length}`);
    usuariosPlanner.forEach((user, index) => {
      console.log(`${index + 1}. ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
    });

    if (usuariosPlanner.length === 0) {
      console.log('ℹ️ No hay usuarios con rol planner para reasignar');
      return;
    }

    console.log('\n🔄 Iniciando reasignación de usuarios...');
    
    // Reasignar usuarios específicos según los nombres mencionados
    for (const user of usuariosPlanner) {
      try {
        let nuevoRol;
        
        // Determinar el nuevo rol basado en el nombre del usuario
        if (user.names.includes('Test') || user.names.includes('Carmen')) {
          // Test User y Carmen Jiménez -> supervisor
          nuevoRol = supervisorRole;
        } else {
          // Otros usuarios -> admin por defecto
          nuevoRol = adminRole;
        }

        // Eliminar la relación actual con planner
        await UserRol.destroy({
          where: {
            userId: user.id,
            rolId: plannerRole.id
          }
        });

        // Crear nueva relación con el nuevo rol
        await UserRol.create({
          userId: user.id,
          rolId: nuevoRol.id
        });

        console.log(`✅ Usuario ${user.names} ${user.apellido_p} reasignado de planner a ${nuevoRol.name}`);
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

    // Verificar usuarios con rol admin
    const usuariosAdmin = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'admin' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n✅ Total de usuarios con rol admin: ${usuariosAdmin.length}`);
    usuariosAdmin.forEach((user, index) => {
      console.log(`${index + 1}. ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
    });

    // Verificar usuarios restantes con rol planner
    const usuariosPlannerRestantes = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'planner' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📊 Usuarios restantes con rol planner: ${usuariosPlannerRestantes.length}`);

  } catch (error) {
    console.error('❌ Error durante la reasignación:', error);
  } finally {
    console.log('🔌 Conexión a la base de datos cerrada');
    await sequelize.close();
  }
}

// Ejecutar la función
reasignarUsuariosPlanner();