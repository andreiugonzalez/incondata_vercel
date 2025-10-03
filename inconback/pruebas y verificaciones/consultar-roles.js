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

// Definir modelo Rol
const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING
}, { tableName: 'rol' });

async function consultarRoles() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');
    
    console.log('\n📋 Consultando tabla rol...');
    const roles = await Rol.findAll({
      order: [['id', 'ASC']]
    });
    
    console.log(`\n📊 Total de roles encontrados: ${roles.length}`);
    console.log('\n📋 Lista de roles disponibles:');
    console.log('='.repeat(50));
    
    roles.forEach(rol => {
      console.log(`ID: ${rol.id} | Nombre: ${rol.name}`);
    });
    
    console.log('\n🔍 Análisis de roles:');
    console.log('-'.repeat(30));
    
    const roleNames = roles.map(r => r.name);
    console.log('Roles de administración:', roleNames.filter(name => 
      name.includes('admin') || name.includes('superadmin')
    ));
    console.log('Roles operativos:', roleNames.filter(name => 
      ['superintendente', 'supervisor', 'inspector', 'planner', 'ITO'].includes(name)
    ));
    console.log('Roles especiales:', roleNames.filter(name => 
      ['externo', 'administrador de contrato'].includes(name)
    ));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

consultarRoles();