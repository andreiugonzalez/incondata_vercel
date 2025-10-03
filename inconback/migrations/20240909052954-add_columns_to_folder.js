'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Folder', 'id_proyecto', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Folder', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Folder', 'id_subpartida', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Folder', 'id_tarea', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Folder', 'id_subtarea', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Folder', 'id_proyecto');
    await queryInterface.removeColumn('Folder', 'id_partida');
    await queryInterface.removeColumn('Folder', 'id_subpartida');
    await queryInterface.removeColumn('Folder', 'id_tarea');
    await queryInterface.removeColumn('Folder', 'id_subtarea');
  }
};
