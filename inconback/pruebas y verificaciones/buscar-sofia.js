require('dotenv').config();
const { sequelize } = require('../src/config/sequelize-config');
const { Op } = require('sequelize');

async function buscarSofia() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos OK');

    const usuarios = await sequelize.models.User.findAll({
      where: {
        names: { [Op.iLike]: '%sofia%' }
      },
      attributes: ['id', 'names', 'apellido_p', 'apellido_m', 'email', 'rut', 'username']
    });

    if (usuarios.length === 0) {
      console.log('⚠️ No se encontraron usuarios con nombre que contenga "sofia"');
    } else {
      console.log(`🔍 Usuarios encontrados: ${usuarios.length}`);
      usuarios.forEach(u => {
        console.log(` - ID:${u.id} ${u.names} ${u.apellido_p || ''} ${u.apellido_m || ''} | ${u.email || ''} | ${u.rut || ''} | ${u.username || ''}`);
      });
    }
  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

buscarSofia();