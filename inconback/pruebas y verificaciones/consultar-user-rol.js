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
const UserRol = sequelize.define('user_rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  rolId: DataTypes.INTEGER
}, { tableName: 'user_rol' });

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  names: DataTypes.STRING,
  apellido_p: DataTypes.STRING,
  apellido_m: DataTypes.STRING,
  email: DataTypes.STRING,
  username: DataTypes.STRING,
  rut: DataTypes.STRING
}, { tableName: 'user' });

// Definir asociaciones
UserRol.belongsTo(Rol, { foreignKey: 'rolId' });
UserRol.belongsTo(User, { foreignKey: 'userId' });

async function consultarUserRol() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');
    
    console.log('\n📋 Consultando tabla user_rol...');
    const userRoles = await UserRol.findAll({
      include: [
        {
          model: Rol,
          attributes: ['id', 'name']
        },
        {
          model: User,
          attributes: ['id', 'names', 'apellido_p', 'username', 'rut']
        }
      ],
      order: [['userId', 'ASC']]
    });
    
    console.log(`\n📊 Total de registros en user_rol: ${userRoles.length}`);
    console.log('\n📋 Detalle de asignaciones usuario-rol:');
    console.log('='.repeat(80));
    
    userRoles.forEach(ur => {
      const userName = ur.User ? `${ur.User.names} ${ur.User.apellido_p}` : 'Usuario no encontrado';
      const userRut = ur.User ? ur.User.rut : 'N/A';
      const roleName = ur.Rol ? ur.Rol.name : 'Rol no encontrado';
      
      console.log(`ID: ${ur.id} | UserID: ${ur.userId} | RolID: ${ur.rolId}`);
      console.log(`   Usuario: ${userName} (${userRut})`);
      console.log(`   Rol: ${roleName}`);
      console.log('-'.repeat(40));
    });

    // Buscar específicamente el usuario superintendente que creamos
    console.log('\n🔍 Buscando usuario superintendente (RUT: 10.923.534-2)...');
    const superintendenteUserRol = userRoles.find(ur => 
      ur.User && ur.User.rut === '10.923.534-2'
    );
    
    if (superintendenteUserRol) {
      console.log('✅ Usuario superintendente encontrado:');
      console.log(`   - ID user_rol: ${superintendenteUserRol.id}`);
      console.log(`   - UserID: ${superintendenteUserRol.userId}`);
      console.log(`   - RolID: ${superintendenteUserRol.rolId}`);
      console.log(`   - Nombre: ${superintendenteUserRol.User.names} ${superintendenteUserRol.User.apellido_p}`);
      console.log(`   - RUT: ${superintendenteUserRol.User.rut}`);
      console.log(`   - Rol: ${superintendenteUserRol.Rol.name}`);
    } else {
      console.log('❌ No se encontró el usuario superintendente en user_rol');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

consultarUserRol();