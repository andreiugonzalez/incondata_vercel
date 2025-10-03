// Script para eliminar usuarios por nombre: Diego, Carmen y Sofia
// Uso: node "pruebas y verificaciones/delete-usuarios-por-nombre.js"

require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');
const { Op } = require('sequelize');
const UserRepository = require('../src/repositories/user.repository');

async function eliminarUsuariosPorNombre(nombresTarget) {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    // Buscar usuarios cuyo "names" contenga alguno de los nombres objetivo (insensible a mayúsculas)
    const usuarios = await sequelize.models.User.findAll({
      where: {
        [Op.or]: nombresTarget.map(n => ({ names: { [Op.iLike]: `%${n}%` } }))
      },
      attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'rut', 'username']
    });

    if (usuarios.length === 0) {
      console.log('⚠️ No se encontraron usuarios con nombres:', nombresTarget.join(', '));
      return;
    }

    console.log(`🔍 Usuarios encontrados: ${usuarios.length}`);
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
    console.log('✅ Proceso de eliminación finalizado.');
  } catch (error) {
    console.error('❌ Error al eliminar usuarios:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

// Ejecutar
eliminarUsuariosPorNombre(['diego', 'carmen', 'sofia']);