'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asegurarse de que id_partida sea la clave primaria en historico_partida
    await queryInterface.changeColumn('historico_partida', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });

    // Asegurarse de que id_subpartida sea la clave primaria en historico_subpartida
    await queryInterface.changeColumn('historico_subpartida', 'id_subpartida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });

    // Asegurarse de que id sea la clave primaria en historico_task
    await queryInterface.changeColumn('historico_task', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });

    // Asegurarse de que id_subtask sea la clave primaria en historico_subtask
    await queryInterface.changeColumn('historico_subtask', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir las claves primarias en caso de rollback

    // Quitar la clave primaria de id_partida en historico_partida
    await queryInterface.changeColumn('historico_partida', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });

    // Quitar la clave primaria de id_subpartida en historico_subpartida
    await queryInterface.changeColumn('historico_subpartida', 'id_subpartida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });

    // Quitar la clave primaria de id en historico_task
    await queryInterface.changeColumn('historico_task', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });

    // Quitar la clave primaria de id_subtask en historico_subtask
    await queryInterface.changeColumn('historico_subtask', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });
  }
};
