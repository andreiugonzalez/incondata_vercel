/**
 * Script: crear-gerardo-superadmin.js
 * Crea el usuario interno "Gerardo Gonzalez Araya" con rol superadmin
 * usando el repositorio createInternalUser y validando duplicados.
 */

const { sequelize } = require('../src/config/sequelize-config');
const UserRepository = require('../src/repositories/user.repository');
const { plantillaUsuarioInterno, generateEncryptedUriFolder } = require('../../pruebas y verificaciones/plantilla-usuario-interno');

async function crearGerardoSuperAdmin() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    const target = {
      email: 'gerardo.incondata@gmail.com',
      password: 'superadmin2024',
      rut: '23.460.750-2',
      nombre: 'Gerardo',
      apellido_p: 'Gonzalez',
      apellido_m: 'Araya',
      username: 'Gerardo',
      genero: 'Masculino',
    };

    // Buscar si ya existe por email/username/rut
    const existingByEmail = await sequelize.models.User.findOne({ where: { email: target.email } });
    const existingByUsername = await sequelize.models.User.findOne({ where: { username: target.username } });
    const existingByRut = await sequelize.models.User.findOne({ where: { rut: target.rut } });

    const existingUser = existingByEmail || existingByUsername || existingByRut;

    // Obtener rol superadmin
    const superAdminRole = await sequelize.models.Rol.findOne({ where: { name: 'superadmin' } });
    if (!superAdminRole) {
      console.log('❌ No se encontró el rol superadmin en la base de datos.');
      return;
    }

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con las credenciales proporcionadas:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Nombre: ${existingUser.names} ${existingUser.apellido_p} ${existingUser.apellido_m}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Username: ${existingUser.username}`);

      // Verificar si ya tiene el rol superadmin
      const existingUserRol = await sequelize.models.UserRol.findOne({
        where: { userId: existingUser.id, rolId: superAdminRole.id },
      });

      if (existingUserRol) {
        console.log('✅ El usuario ya tiene rol de superadmin.');
      } else {
        console.log('🔄 Asignando rol superadmin al usuario existente...');
        await sequelize.models.UserRol.create({ userId: existingUser.id, rolId: superAdminRole.id });
        console.log('✅ Rol superadmin asignado correctamente.');
      }
      return;
    }

    // Preparar datos completos requeridos por createInternalUser
    const personal = {
      ...plantillaUsuarioInterno.personal,
      rut: target.rut,
      nombre: target.nombre,
      apellido_p: target.apellido_p,
      apellido_m: target.apellido_m,
      email: target.email,
      password: target.password,
      genero: target.genero,
      username: target.username,
      urifolder: generateEncryptedUriFolder(),
      // Valores razonables por defecto para campos requeridos
      fecha_de_nacimiento: '1990-01-01',
      telefono: '912345678',
      direccion: 'Dirección por defecto',
      estado_cuenta: 1,
      ID_comuna: 1,
      estado_civil: 1,
      codtelefono: 56,
      codigo_postal: '0000000',
    };

    const laboral = {
      ...plantillaUsuarioInterno.laboral,
      id_rol: superAdminRole.id,
      organizacionid: 1,
      id_salud: 1,
      id_afp: 1,
      id_puesto: 1,
      id_grupo: 1,
      telefono_emergencia: '912345678',
      codigo_area_emergencia: 56,
      nombre_emergencia: 'Contacto Emergencia',
      id_relacion_emergencia: 1,
      correo_emergencia: 'contacto@dominio.com',
    };

    console.log('🔄 Creando usuario interno (Gerardo) con rol superadmin...');
    const user = await UserRepository.createInternalUser(personal, laboral);

    console.log('🎉 Usuario creado exitosamente:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.names} ${user.apellido_p} ${user.apellido_m}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log('📋 Credenciales:');
    console.log(`   Email: ${target.email}`);
    console.log(`   Password: ${target.password}`);
    console.log(`   RUT: ${target.rut}`);
  } catch (error) {
    console.error('❌ Error al crear usuario Gerardo superadmin:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar el script
crearGerardoSuperAdmin();