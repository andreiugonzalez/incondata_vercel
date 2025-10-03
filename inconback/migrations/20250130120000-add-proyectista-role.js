'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si el rol 'proyectista' ya existe
    const [results] = await queryInterface.sequelize.query(
      "SELECT id FROM rol WHERE name = 'proyectista'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Solo insertar si no existe
    if (!results || results.length === 0) {
      await queryInterface.bulkInsert('rol', [
        {
          name: 'proyectista',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      console.log('✅ Rol "proyectista" agregado exitosamente');
    } else {
      console.log('ℹ️ El rol "proyectista" ya existe en la base de datos');
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar el rol 'proyectista' si existe
    await queryInterface.bulkDelete('rol', {
      name: 'proyectista'
    });
    
    console.log('🗑️ Rol "proyectista" eliminado');
  }
};