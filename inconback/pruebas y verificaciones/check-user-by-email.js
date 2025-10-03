// Script para verificar existencia de usuario por email y mostrar detalles
// Uso: node "pruebas y verificaciones/check-user-by-email.js" <email>

require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize } = require('../src/config/sequelize-config');

async function checkUserByEmail(email) {
  if (!email) {
    console.error('❌ Debe proporcionar un correo. Ejemplo: node "pruebas y verificaciones/check-user-by-email.js" admin@tudominio.com');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    const User = sequelize.models.User;

    // Buscar usuario por email (case-insensitive)
    const user = await User.findOne({
      where: { email: { [Op.iLike]: email } },
      attributes: [
        'id', 'names', 'apellido_p', 'apellido_m', 'email', 'username', 'rut',
        'organizacionid', 'id_puesto', 'id_estado_cuenta'
      ],
      include: [
        { association: 'roles', attributes: ['name'] },
        { association: 'organizacion', attributes: ['nombre'] }
      ]
    });

    if (!user) {
      console.log(`❌ No se encontró usuario con el correo: ${email}`);
      return 1;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.names || ''} ${user.apellido_p || ''} ${user.apellido_m || ''}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username || ''}`);
    console.log(`   - RUT: ${user.rut || ''}`);
    console.log(`   - Organización ID: ${user.organizacionid || 'N/A'}`);
    console.log(`   - Organización: ${user.organizacion ? user.organizacion.nombre : 'No asignada'}`);
    console.log(`   - Puesto ID: ${user.id_puesto || 'N/A'}`);
    console.log(`   - Estado cuenta ID: ${user.id_estado_cuenta || 'N/A'}`);
    console.log(`   - Roles: ${user.roles && user.roles.length ? user.roles.map(r => r.name).join(', ') : 'Sin roles'}`);

    return 0;
  } catch (err) {
    console.error('❌ Error al consultar usuario:', err.message);
    return 2;
  } finally {
    try { await sequelize.close(); } catch {}
    console.log('🔒 Conexión cerrada.');
  }
}

const emailArg = process.argv[2];
checkUserByEmail(emailArg).then(code => process.exit(code));