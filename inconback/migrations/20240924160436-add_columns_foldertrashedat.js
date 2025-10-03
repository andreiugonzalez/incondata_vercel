'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Folder', 'trashedAt', {
      type: Sequelize.DATE,
      allowNull: true, // Permite nulos ya que solo se usará cuando el archivo esté en la papelera
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Folder', 'trashedAt');
  }
};
