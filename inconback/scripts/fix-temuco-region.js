const { sequelize } = require('../src/config/sequelize-config');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD OK');

    const { Comuna, Region } = sequelize.models;

    // Verificar que la región 12 exista y sea Araucanía
    const regionAraucania = await Region.findOne({ where: { id_region: 12 } });
    if (!regionAraucania) {
      throw new Error('No existe id_region=12 (Región de La Araucanía)');
    }

    // Intentar actualizar por id_comuna primero
    let comuna = await Comuna.findOne({ where: { id_comuna: 91401 } });
    if (!comuna) {
      console.log('No se encontró id_comuna=91401, intento por nombre="Temuco"');
      comuna = await Comuna.findOne({ where: { nombre: 'Temuco' } });
      if (!comuna) {
        throw new Error('No se encontró la comuna Temuco');
      }
    }

    if (comuna.id_region !== 12) {
      comuna.id_region = 12;
      await comuna.save();
      console.log(`Actualizada comuna ${comuna.nombre} (id ${comuna.id_comuna}) a id_region=12`);
    } else {
      console.log('Temuco ya está con id_region=12');
    }
  } catch (e) {
    console.error('Error actualizando Temuco:', e.message || e);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
    } catch (e) {}
  }
})();