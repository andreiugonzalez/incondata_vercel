const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('incondata_demo', 'usr_prac2025', 'Usr*2025.', {
  host: '52.22.171.179',
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
  rut: {
    type: DataTypes.STRING,
    allowNull: false
  }
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rol,
      key: 'id'
    }
  }
}, {
  tableName: 'user_rol',
  timestamps: false
});

// Definir asociaciones
User.belongsToMany(Rol, { through: UserRol, foreignKey: 'userId', as: 'roles' });
Rol.belongsToMany(User, { through: UserRol, foreignKey: 'rolId', as: 'users' });

async function investigarRolesAEliminar() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Buscar los roles que se van a eliminar
    const rolesAEliminar = ['contratista', 'planner', 'prevencionista'];
    
    console.log('\n🔍 INVESTIGANDO ROLES A ELIMINAR:');
    console.log('=====================================');

    for (const nombreRol of rolesAEliminar) {
      console.log(`\n📋 ROL: ${nombreRol.toUpperCase()}`);
      console.log('-'.repeat(30));

      // Buscar el rol
      const rol = await Rol.findOne({
        where: { name: nombreRol }
      });

      if (!rol) {
        console.log(`❌ El rol "${nombreRol}" no existe en la base de datos.`);
        continue;
      }

      console.log(`✅ Rol encontrado - ID: ${rol.id}, Nombre: ${rol.name}`);

      // Buscar usuarios con este rol
      const usuariosConRol = await User.findAll({
        include: [{
          model: Rol,
          as: 'roles',
          where: { name: nombreRol },
          through: { attributes: [] }
        }]
      });

      if (usuariosConRol.length === 0) {
        console.log(`📝 No hay usuarios asignados al rol "${nombreRol}".`);
      } else {
        console.log(`👥 Usuarios con rol "${nombreRol}" (${usuariosConRol.length}):`);
        usuariosConRol.forEach((usuario, index) => {
          console.log(`   ${index + 1}. ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m} (${usuario.email}) - RUT: ${usuario.rut}`);
        });
      }
    }

    // Verificar si existe el rol "ito"
    console.log('\n🔍 VERIFICANDO ROL ITO:');
    console.log('========================');
    
    const rolIto = await Rol.findOne({
      where: { name: 'ito' }
    });

    if (rolIto) {
      console.log(`✅ Rol "ito" encontrado - ID: ${rolIto.id}, Nombre: ${rolIto.name}`);
      
      // Contar usuarios con rol ito
      const usuariosIto = await User.findAll({
        include: [{
          model: Rol,
          as: 'roles',
          where: { name: 'ito' },
          through: { attributes: [] }
        }]
      });
      
      console.log(`👥 Usuarios actuales con rol "ito": ${usuariosIto.length}`);
      if (usuariosIto.length > 0) {
        usuariosIto.forEach((usuario, index) => {
          console.log(`   ${index + 1}. ${usuario.names} ${usuario.apellido_p} ${usuario.apellido_m} (${usuario.email})`);
        });
      }
    } else {
      console.log('❌ El rol "ito" no existe en la base de datos. Será necesario crearlo.');
    }

    console.log('\n📊 RESUMEN:');
    console.log('============');
    console.log('- Roles a eliminar: contratista, planner, prevencionista');
    console.log('- Rol destino para funciones de contratista: ito');
    console.log('- Siguiente paso: Analizar permisos y funciones del rol contratista');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

investigarRolesAEliminar();