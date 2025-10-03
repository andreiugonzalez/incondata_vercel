'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('document', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('document', 'id_subpartida', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('document', 'id_tarea', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('document', 'id_subtarea', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('document', 'id_partida');
    await queryInterface.removeColumn('document', 'id_subpartida');
    await queryInterface.removeColumn('document', 'id_tarea');
    await queryInterface.removeColumn('document', 'id_subtarea');
  }
};
