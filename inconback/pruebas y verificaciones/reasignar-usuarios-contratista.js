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
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  names: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_p: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_m: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  hashedPassword: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING
}, {
  tableName: 'user',
  timestamps: false
});

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'rol',
  timestamps: false
});

const UserRol = sequelize.define('UserRol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rol,
      key: 'id'
    }
  }
}, {
  tableName: 'user_rol',
  timestamps: true
});

// Definir asociaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId' });

async function reasignarUsuariosContratista() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Buscar el rol ITO
    const rolITO = await Rol.findOne({ where: { name: 'ITO' } });
    if (!rolITO) {
      console.log('❌ Error: No se encontró el rol ITO');
      return;
    }
    console.log(`✅ Rol ITO encontrado con ID: ${rolITO.id}`);

    // Buscar el rol contratista
    const rolContratista = await Rol.findOne({ where: { name: 'contratista' } });
    if (!rolContratista) {
      console.log('❌ Error: No se encontró el rol contratista');
      return;
    }
    console.log(`✅ Rol contratista encontrado con ID: ${rolContratista.id}`);

    // Buscar usuarios con rol contratista
    const usuariosContratista = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'contratista' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📋 Usuarios con rol contratista encontrados: ${usuariosContratista.length}`);
    
    if (usuariosContratista.length === 0) {
      console.log('ℹ️ No hay usuarios con rol contratista para reasignar');
      return;
    }

    // Mostrar usuarios a reasignar
    usuariosContratista.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m} (${usuario.email})`);
    });

    console.log('\n🔄 Iniciando reasignación de usuarios...');

    // Reasignar cada usuario
    for (const usuario of usuariosContratista) {
      try {
        // Eliminar la relación con el rol contratista
        await UserRol.destroy({
          where: {
            userId: usuario.id,
            rolId: rolContratista.id
          }
        });

        // Verificar si ya tiene el rol ITO
        const existeRelacionITO = await UserRol.findOne({
          where: {
            userId: usuario.id,
            rolId: rolITO.id
          }
        });

        if (!existeRelacionITO) {
          // Crear la relación con el rol ITO
          await UserRol.create({
            userId: usuario.id,
            rolId: rolITO.id
          });
        }

        console.log(`✅ Usuario ${usuario.names} ${usuario.apellido_p} reasignado de contratista a ITO`);
      } catch (error) {
        console.log(`❌ Error al reasignar usuario ${usuario.names} ${usuario.apellido_p}:`, error.message);
      }
    }

    console.log('\n🎉 Proceso de reasignación completado');

    // Verificar la reasignación
    console.log('\n🔍 Verificando reasignación...');
    const usuariosITO = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'ITO' },
        through: { attributes: [] }
      }]
    });

    console.log(`✅ Total de usuarios con rol ITO: ${usuariosITO.length}`);
    usuariosITO.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m} (${usuario.email})`);
    });

    // Verificar que no queden usuarios con rol contratista
    const usuariosContratistaRestantes = await User.findAll({
      include: [{
        model: Rol,
        where: { name: 'contratista' },
        through: { attributes: [] }
      }]
    });

    console.log(`\n📊 Usuarios restantes con rol contratista: ${usuariosContratistaRestantes.length}`);

  } catch (error) {
    console.error('❌ Error durante la reasignación:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script
reasignarUsuariosContratista();