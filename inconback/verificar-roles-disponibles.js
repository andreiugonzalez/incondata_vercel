const { sequelize } = require('./src/config/sequelize-config');

async function verificarRolesDisponibles() {
  try {
    console.log('🔍 Verificando roles disponibles en la base de datos...\n');

    // Obtener todos los roles de la base de datos
    const [roles] = await sequelize.query('SELECT id, name FROM rol ORDER BY name');
    
    console.log('📋 Roles encontrados en la base de datos:');
    console.log('=====================================');
    roles.forEach(rol => {
      console.log(`ID: ${rol.id} | Nombre: ${rol.name}`);
    });

    console.log('\n🎯 Roles configurados para usuarios internos:');
    console.log('=============================================');
    const rolesInternos = [
      'admin',
      'superadmin', 
      'superintendente',
      'supervisor',
      'ITO',
      'proyectista',
      'normal',
      'administrador de contrato'
    ];

    rolesInternos.forEach(rolInterno => {
      const existe = roles.find(rol => rol.name === rolInterno);
      if (existe) {
        console.log(`✅ ${rolInterno} (ID: ${existe.id})`);
      } else {
        console.log(`❌ ${rolInterno} - NO EXISTE EN LA BASE DE DATOS`);
      }
    });

    console.log('\n📊 Resumen:');
    console.log('===========');
    const existentes = rolesInternos.filter(rolInterno => 
      roles.find(rol => rol.name === rolInterno)
    );
    const faltantes = rolesInternos.filter(rolInterno => 
      !roles.find(rol => rol.name === rolInterno)
    );

    console.log(`✅ Roles existentes: ${existentes.length}/${rolesInternos.length}`);
    console.log(`❌ Roles faltantes: ${faltantes.length}`);
    
    if (faltantes.length > 0) {
      console.log('\n⚠️  Roles que necesitan ser creados:');
      faltantes.forEach(rol => console.log(`   - ${rol}`));
    }

  } catch (error) {
    console.error('❌ Error al verificar roles:', error);
  } finally {
    await sequelize.close();
  }
}

verificarRolesDisponibles();