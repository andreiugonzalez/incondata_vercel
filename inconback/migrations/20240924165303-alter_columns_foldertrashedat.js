'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Folder', 'trashedAt', {
      type: Sequelize.DATE,
      allowNull: true,  // Permitir valores null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Folder', 'trashedAt', {
      type: Sequelize.DATE,
      allowNull: false,  // Revertir la migración si es necesario
    });
  }
};
