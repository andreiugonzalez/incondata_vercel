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

async function eliminarRolesObsoletos() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    const rolesAEliminar = ['contratista', 'planner', 'prevencionista'];

    console.log('🔍 Verificando roles a eliminar...');
    
    for (const nombreRol of rolesAEliminar) {
      console.log(`\n📋 Procesando rol: ${nombreRol}`);
      
      // Buscar el rol
      const rol = await Rol.findOne({ where: { name: nombreRol } });
      
      if (!rol) {
        console.log(`⚠️ Rol ${nombreRol} no encontrado en la base de datos`);
        continue;
      }
      
      console.log(`✅ Rol ${nombreRol} encontrado con ID: ${rol.id}`);
      
      // Verificar si hay usuarios asignados a este rol
      const usuariosConRol = await User.findAll({
        include: [{
          model: Rol,
          where: { name: nombreRol },
          through: { attributes: [] }
        }]
      });
      
      if (usuariosConRol.length > 0) {
        console.log(`❌ No se puede eliminar el rol ${nombreRol}. Aún tiene ${usuariosConRol.length} usuarios asignados:`);
        usuariosConRol.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.names} ${user.apellido_p} ${user.apellido_m} (${user.email})`);
        });
        continue;
      }
      
      console.log(`✅ El rol ${nombreRol} no tiene usuarios asignados. Procediendo a eliminar...`);
      
      try {
        // Eliminar primero cualquier relación en user_rol (por seguridad)
        await UserRol.destroy({
          where: { rolId: rol.id }
        });
        
        // Eliminar el rol
        await Rol.destroy({
          where: { id: rol.id }
        });
        
        console.log(`🗑️ Rol ${nombreRol} eliminado exitosamente`);
      } catch (error) {
        console.log(`❌ Error al eliminar el rol ${nombreRol}: ${error.message}`);
      }
    }

    console.log('\n🎉 Proceso de eliminación de roles completado');

    // Mostrar roles restantes
    console.log('\n📊 Roles restantes en la base de datos:');
    const rolesRestantes = await Rol.findAll();
    rolesRestantes.forEach((rol, index) => {
      console.log(`${index + 1}. ${rol.name} (ID: ${rol.id})`);
    });

  } catch (error) {
    console.error('❌ Error durante la eliminación de roles:', error);
  } finally {
    console.log('🔌 Conexión a la base de datos cerrada');
    await sequelize.close();
  }
}

// Ejecutar la función
eliminarRolesObsoletos();