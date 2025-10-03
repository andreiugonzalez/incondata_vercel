'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Índice en parent_folder_id
    await queryInterface.addIndex('Folder', ['parent_folder_id'], {
      name: 'idx_folder_parent_folder_id',
      using: 'btree',
    });

    // Índice en path
    await queryInterface.addIndex('Folder', ['path'], {
      name: 'idx_folder_path',
      using: 'btree',
    });

    // Índice compuesto en id_proyecto y nombre_carpeta
    await queryInterface.addIndex('Folder', ['id_proyecto', 'nombre_carpeta'], {
      name: 'idx_folder_project_name',
      using: 'btree',
    });

    // Índice GIN en favorited_by_users
    await queryInterface.addIndex('Folder', ['favorited_by_users'], {
      name: 'idx_folder_favorited_by_users',
      using: 'gin',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar los índices en caso de rollback
    await queryInterface.removeIndex('Folder', 'idx_folder_parent_folder_id');
    await queryInterface.removeIndex('Folder', 'idx_folder_path');
    await queryInterface.removeIndex('Folder', 'idx_folder_project_name');
    await queryInterface.removeIndex('Folder', 'idx_folder_favorited_by_users');
  }
};
