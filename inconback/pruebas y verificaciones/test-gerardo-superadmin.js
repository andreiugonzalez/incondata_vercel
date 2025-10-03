const bcrypt = require('bcrypt');
const { sequelize, User, Rol, UserRol } = require('../src/config/sequelize-config');

async function testGerardoSuperAdmin() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    const targetEmail = 'gerardo.incondata@gmail.com';
    const targetRut = '23.460.750-2';
    
    console.log(`\n🔍 Buscando usuario superadmin: ${targetEmail}`);
    
    // Buscar el usuario
    let user = await User.findOne({
      where: { email: targetEmail },
      include: [{
        model: Rol,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      console.log('⚠️ No se encontró por email, intentando por username y RUT...');
      user = await User.findOne({
        where: { username: 'Gerardo' },
        include: [{ model: Rol, as: 'roles', through: { attributes: [] }, attributes: ['id', 'name'] }]
      }) || await User.findOne({
        where: { rut: targetRut },
        include: [{ model: Rol, as: 'roles', through: { attributes: [] }, attributes: ['id', 'name'] }]
      });
    }

    if (!user) {
      console.log('❌ No se encontró el usuario superadmin.');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - RUT: ${user.rut}`);
    console.log(`   - Estado cuenta: ${user.id_estado_cuenta}`);
    console.log(`   - Organización ID: ${user.organizacionid}`);

    // Verificar roles
    console.log('\n🔍 Verificando roles del usuario...');
    if (user.roles && user.roles.length > 0) {
      console.log('✅ Roles asignados:');
      user.roles.forEach(rol => {
        console.log(`   - ${rol.name} (ID: ${rol.id})`);
      });
    } else {
      console.log('❌ No se encontraron roles asignados al usuario.');
    }

    // Probar diferentes contraseñas posibles
    const possiblePasswords = [
      'Super2024!',
      'SuperAdmin2024!',
      'Gerardo123',
      'gerardo123',
      'admin123',
      'superadmin',
      '123456'
    ];

    console.log('\n🔍 Probando contraseñas posibles...');
    for (const password of possiblePasswords) {
      try {
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (isValid) {
          console.log(`✅ Contraseña válida encontrada: ${password}`);
          break;
        } else {
          console.log(`❌ Contraseña incorrecta: ${password}`);
        }
      } catch (error) {
        console.log(`⚠️  Error probando contraseña ${password}: ${error.message}`);
      }
    }

    // Verificar estado de cuenta
    console.log('\n🔍 Verificando estado de cuenta...');
    if (user.id_estado_cuenta === 1) {
      console.log('✅ La cuenta está activa.');
    } else {
      console.log(`⚠️  La cuenta no está activa. Estado: ${user.id_estado_cuenta}`);
    }

    console.log('\n📋 CREDENCIALES DEL USUARIO SUPERADMIN:');
    console.log('=====================================');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`RUT: ${user.rut}`);
    console.log('Password: [Probar las contraseñas listadas arriba]');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada.');
  }
}

testGerardoSuperAdmin();