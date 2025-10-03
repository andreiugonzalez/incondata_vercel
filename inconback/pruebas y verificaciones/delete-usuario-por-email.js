// Script para eliminar usuario por correo electrónico
// Uso: node "pruebas y verificaciones/delete-usuario-por-email.js" <email>

require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');
const UserRepository = require('../src/repositories/user.repository');
const { Op } = require('sequelize');

async function eliminarUsuarioPorEmail(email) {
  if (!email) {
    console.error('❌ Debe proporcionar un correo. Ejemplo: node "pruebas y verificaciones/delete-usuario-por-email.js" sofia.herrera@incondata.cl');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    // Buscar usuarios por email (insensible a mayúsculas)
    const usuarios = await sequelize.models.User.findAll({
      where: { email: { [Op.iLike]: email } },
      attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'rut', 'username']
    });

    if (usuarios.length === 0) {
      console.log(`⚠️ No se encontraron usuarios con el correo: ${email}`);
      return;
    }

    console.log(`🔍 Usuarios encontrados con ${email}: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(` - ID:${u.id} ${u.names} ${u.apellido_p || ''} ${u.apellido_m || ''} | ${u.email || ''} | ${u.rut || ''} | ${u.username || ''}`);
    });

    // Eliminar usando repositorio para limpiar asociaciones
    for (const u of usuarios) {
      try {
        const result = await UserRepository.deleteUser(u.id);
        console.log(`🗑️ Usuario ID ${u.id} eliminado: ${result.message}`);
      } catch (err) {
        console.error(`❌ Error al eliminar usuario ID ${u.id}:`, err.message);
      }
    }

    // Verificar que ya no existe
    const verificacion = await sequelize.models.User.findAll({
      where: { email: { [Op.iLike]: email } },
      attributes: ['id']
    });
    if (verificacion.length === 0) {
      console.log('✅ Verificación: no existe usuario con ese correo tras la eliminación.');
    } else {
      console.warn('⚠️ Verificación: aún existen registros con ese correo:', verificacion.map(v => v.id));
    }
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

// Ejecutar con el email proporcionado por CLI
const emailArg = (process.argv[2] || '').trim();
eliminarUsuarioPorEmail(emailArg);