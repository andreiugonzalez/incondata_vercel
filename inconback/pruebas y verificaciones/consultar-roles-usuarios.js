const { Sequelize, DataTypes } = require('sequelize');

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
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING
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
UserRol.belongsTo(User, { foreignKey: 'userId' });
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });

async function consultarRolesUsuarios() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');
    
    // Consultar todos los usuarios con sus roles
    console.log('📋 Consultando usuarios y sus roles asignados...');
    const userRoles = await UserRol.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'rut', 'username']
        },
        {
          model: Rol,
          attributes: ['id', 'name']
        }
      ],
      order: [['userId', 'ASC']]
    });
    
    console.log(`📊 Total de asignaciones usuario-rol: ${userRoles.length}\n`);
    
    if (userRoles.length === 0) {
      console.log('⚠️ No se encontraron asignaciones de roles a usuarios');
      return;
    }
    
    console.log('📋 Detalle de usuarios con roles asignados:');
    console.log('='.repeat(100));
    
    userRoles.forEach(ur => {
      const user = ur.User;
      const rol = ur.Rol;
      
      if (user && rol) {
        const fullName = `${user.names} ${user.apellido_p} ${user.apellido_m || ''}`.trim();
        console.log(`👤 Usuario ID: ${user.id}`);
        console.log(`   Nombre: ${fullName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   RUT: ${user.rut}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   🎭 Rol: ${rol.name} (ID: ${rol.id})`);
        console.log('-'.repeat(80));
      }
    });
    
    // Buscar específicamente a Carlos González
    console.log('\n🔍 Buscando específicamente a Carlos González...');
    const carlosRoles = userRoles.filter(ur => 
      ur.User && ur.User.email === 'carlos.gonzalez@incondata.cl'
    );
    
    if (carlosRoles.length > 0) {
      console.log('✅ Carlos González encontrado con los siguientes roles:');
      carlosRoles.forEach(ur => {
        console.log(`   - ${ur.Rol.name} (ID: ${ur.Rol.id})`);
      });
    } else {
      console.log('❌ Carlos González no tiene roles asignados o no existe en user_rol');
      
      // Verificar si el usuario existe en la tabla user
      const carlosUser = await User.findOne({
        where: { email: 'carlos.gonzalez@incondata.cl' }
      });
      
      if (carlosUser) {
        console.log(`✅ El usuario Carlos González existe (ID: ${carlosUser.id}) pero no tiene roles asignados`);
      } else {
        console.log('❌ El usuario Carlos González no existe en la base de datos');
      }
    }
    
    // Mostrar todos los roles disponibles
    console.log('\n📋 Roles disponibles en el sistema:');
    const allRoles = await Rol.findAll({
      order: [['id', 'ASC']]
    });
    
    allRoles.forEach(rol => {
      console.log(`   ${rol.id}: ${rol.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error al consultar roles de usuarios:', error.message);
  } finally {
    await sequelize.close();
  }
}

consultarRolesUsuarios();