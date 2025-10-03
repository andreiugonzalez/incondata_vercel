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

const UserRol = sequelize.define('user_rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

async function deleteSuperAdmin2User() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const targetRut = '18.640.663-K';
    const targetUsername = 'superadmin2';
    
    // Buscar el usuario con RUT o username
    console.log(`🔍 Buscando usuario con RUT: ${targetRut} o username: ${targetUsername}`);
    const userToDelete = await User.findOne({
      where: {
        [Op.or]: [
          { rut: targetRut },
          { username: targetUsername }
        ]
      }
    });

    if (!userToDelete) {
      console.log('⚠️  No se encontró usuario con ese RUT o username.');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   - ID: ${userToDelete.id}`);
    console.log(`   - RUT: ${userToDelete.rut}`);
    console.log(`   - Username: ${userToDelete.username}`);
    console.log(`   - Email: ${userToDelete.email}`);

    // Eliminar relaciones en user_rol
    console.log('🔄 Eliminando relaciones de roles...');
    const deletedRoles = await UserRol.destroy({
      where: { userId: userToDelete.id }
    });
    console.log(`✅ ${deletedRoles} relaciones de roles eliminadas.`);

    // Eliminar el usuario
    console.log('🔄 Eliminando usuario...');
    await userToDelete.destroy();
    console.log('✅ Usuario eliminado exitosamente.');

  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar el script
deleteSuperAdmin2User();