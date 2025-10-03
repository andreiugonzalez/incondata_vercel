const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('incondata_demo', 'usr_prac2025', 'Usr*2025.', {
  host: '52.22.171.179',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Desactivar logs de SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Definir el modelo Rol
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

// Definir el modelo UserRol para verificar dependencias
const UserRol = sequelize.define('UserRol', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'user_rol',
  timestamps: false
});

async function eliminarRolDuplicado() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    console.log('\n📋 Buscando roles duplicados...');
    
    // Buscar roles duplicados por nombre
    const rolesDuplicados = await sequelize.query(`
      SELECT name, COUNT(*) as count, array_agg(id) as ids
      FROM rol 
      GROUP BY name 
      HAVING COUNT(*) > 1
      ORDER BY name
    `, { type: Sequelize.QueryTypes.SELECT });

    if (rolesDuplicados.length === 0) {
      console.log('✅ No se encontraron roles duplicados');
      return;
    }

    console.log('🔍 Roles duplicados encontrados:');
    rolesDuplicados.forEach(rol => {
      console.log(`  - ${rol.name}: IDs [${rol.ids.join(', ')}] (${rol.count} duplicados)`);
    });

    // Para cada rol duplicado, mantener el de menor ID y eliminar los demás
    for (const rolDuplicado of rolesDuplicados) {
      const ids = rolDuplicado.ids.sort((a, b) => a - b); // Ordenar IDs
      const idAMantener = ids[0]; // Mantener el ID más pequeño
      const idsAEliminar = ids.slice(1); // Eliminar los demás

      console.log(`\n🔧 Procesando rol "${rolDuplicado.name}":`);
      console.log(`  - Manteniendo ID: ${idAMantener}`);
      console.log(`  - Eliminando IDs: [${idsAEliminar.join(', ')}]`);

      // Verificar si hay usuarios asignados a los roles que se van a eliminar
      for (const idAEliminar of idsAEliminar) {
        const usuariosAsignados = await UserRol.findAll({
          where: { rolId: idAEliminar }
        });

        if (usuariosAsignados.length > 0) {
          console.log(`  ⚠️  El rol ID ${idAEliminar} tiene ${usuariosAsignados.length} usuario(s) asignado(s)`);
          console.log(`  🔄 Reasignando usuarios del rol ID ${idAEliminar} al rol ID ${idAMantener}...`);
          
          // Reasignar usuarios al rol que se mantiene
          await UserRol.update(
            { rolId: idAMantener },
            { where: { rolId: idAEliminar } }
          );
          
          console.log(`  ✅ Usuarios reasignados exitosamente`);
        }

        // Eliminar el rol duplicado
        console.log(`  🗑️  Eliminando rol ID ${idAEliminar}...`);
        await Rol.destroy({
          where: { id: idAEliminar }
        });
        console.log(`  ✅ Rol ID ${idAEliminar} eliminado exitosamente`);
      }
    }

    console.log('\n📊 Verificando resultado final...');
    const rolesFinales = await Rol.findAll({
      order: [['id', 'ASC']]
    });

    console.log('🎯 Roles restantes en la base de datos:');
    rolesFinales.forEach(rol => {
      console.log(`  - ID: ${rol.id}, Nombre: ${rol.name}`);
    });

    // Verificar que no hay más duplicados
    const verificacionDuplicados = await sequelize.query(`
      SELECT name, COUNT(*) as count
      FROM rol 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `, { type: Sequelize.QueryTypes.SELECT });

    if (verificacionDuplicados.length === 0) {
      console.log('\n✅ ¡Proceso completado! No quedan roles duplicados en la base de datos.');
    } else {
      console.log('\n⚠️  Aún existen roles duplicados:');
      verificacionDuplicados.forEach(rol => {
        console.log(`  - ${rol.name}: ${rol.count} duplicados`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    console.log('\n🔌 Cerrando conexión a la base de datos...');
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  }
}

// Ejecutar el script
eliminarRolDuplicado();