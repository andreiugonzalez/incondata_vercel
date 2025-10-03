'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Folder', 'size', {
      type: Sequelize.BIGINT, // Usamos BIGINT para almacenar grandes cantidades de bytes
      allowNull: false,        // La columna no puede ser nula
      defaultValue: 0,         // El tamaño por defecto es 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Folder', 'size');
  }
};
