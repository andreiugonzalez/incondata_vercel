'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
 
    await queryInterface.removeConstraint('HistoricoMaterial', 'HistoricoMaterial_id_organizacion_fkey1');
  },

  down: async (queryInterface, Sequelize) => {
 
    await queryInterface.addConstraint('HistoricoMaterial', {
      fields: ['id_organizacion'], 
      type: 'foreign key',
      name: 'HistoricoMaterial_id_organizacion_fkey1',
      references: {
        table: 'organizacion', 
        field: 'id',           
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
};
