'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar el índice creado en parent_folder_id
    await queryInterface.removeIndex('Folder', 'idx_folder_parent_folder_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Volver a crear el índice si se hace rollback
    await queryInterface.addIndex('Folder', ['parent_folder_id'], {
      name: 'idx_folder_parent_folder_id',
      using: 'btree',
    });
  }
};
