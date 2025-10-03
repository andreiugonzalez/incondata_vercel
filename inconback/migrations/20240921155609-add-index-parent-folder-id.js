'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear el índice en parent_folder_id
    await queryInterface.addIndex('Folder', ['parent_folder_id'], {
      name: 'idx_folder_parent_folder_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar el índice si se revierte la migración
    await queryInterface.removeIndex('Folder', 'idx_folder_parent_folder_id');
  }
};
