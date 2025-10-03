// Script para asignar rol 'admin' a un usuario por email
// Uso: node "pruebas y verificaciones/asignar-rol-admin-por-email.js" <email>

require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');

async function asignarRolAdmin(email) {
  if (!email) {
    console.error('❌ Debe proporcionar un correo. Ejemplo: node "pruebas y verificaciones/asignar-rol-admin-por-email.js" admin@tudominio.com');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    const User = sequelize.models.User;
    const Rol = sequelize.models.Rol;
    const UserRol = sequelize.models.user_rol || sequelize.models.UserRol || sequelize.models.User_Rol;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`❌ No se encontró usuario con el correo: ${email}`);
      return 1;
    }

    const adminRole = await Rol.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      console.log('❌ No existe el rol "admin" en la base de datos');
      return 2;
    }

    // Verificar si ya tiene el rol
    const existing = await UserRol.findOne({ where: { userId: user.id, rolId: adminRole.id } });
    if (existing) {
      console.log('ℹ️ El usuario ya tiene el rol admin.');
    } else {
      await UserRol.create({ userId: user.id, rolId: adminRole.id });
      console.log('✅ Rol admin asignado correctamente.');
    }

    // Mostrar roles actuales
    const roles = await user.getRoles();
    console.log('👤 Usuario:', user.email, '| Roles:', roles.map(r => r.name).join(', ') || 'Sin roles');
    return 0;
  } catch (err) {
    console.error('❌ Error al asignar rol:', err.message);
    return 3;
  } finally {
    try { await sequelize.close(); } catch {}
    console.log('🔒 Conexión cerrada.');
  }
}

const emailArg = process.argv[2];
asignarRolAdmin(emailArg).then(code => process.exit(code));