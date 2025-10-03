// Script para actualizar la contraseña de un usuario por email
// Uso: node "pruebas y verificaciones/actualizar-password-por-email.js" <email> <password>

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/sequelize-config');

async function actualizarPassword(email, password) {
  if (!email || !password) {
    console.error('❌ Debe proporcionar correo y contraseña. Ejemplo: node "pruebas y verificaciones/actualizar-password-por-email.js" admin@tudominio.com contra123');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    const User = sequelize.models.User;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`❌ No se encontró usuario con el correo: ${email}`);
      return 1;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update(
      { hashedPassword, isTemporaryPassword: false, passwordExpirationDate: null },
      { where: { id: user.id }, fields: ['hashedPassword', 'isTemporaryPassword', 'passwordExpirationDate'] }
    );
    console.log('✅ Contraseña actualizada correctamente para:', email);
    return 0;
  } catch (err) {
    console.error('❌ Error al actualizar contraseña:', err.message);
    return 2;
  } finally {
    try { await sequelize.close(); } catch {}
    console.log('🔒 Conexión cerrada.');
  }
}

const emailArg = process.argv[2];
const passwordArg = process.argv[3];
actualizarPassword(emailArg, passwordArg).then(code => process.exit(code));
