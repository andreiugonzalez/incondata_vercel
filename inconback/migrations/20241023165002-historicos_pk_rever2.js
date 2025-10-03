'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar clave primaria a la columna id_historico en historico_partida
    await queryInterface.changeColumn('historico_partida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Agregar clave primaria a la columna id_historico en historico_subpartida
    await queryInterface.changeColumn('historico_subpartida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Agregar clave primaria a la columna id_historico en historico_task
    await queryInterface.changeColumn('historico_task', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Agregar clave primaria a la columna id_historico en historico_subtask
    await queryInterface.changeColumn('historico_subtask', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover la clave primaria de id_historico en historico_partida
    await queryInterface.changeColumn('historico_partida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: false
    });

    // Remover la clave primaria de id_historico en historico_subpartida
    await queryInterface.changeColumn('historico_subpartida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: false
    });

    // Remover la clave primaria de id_historico en historico_task
    await queryInterface.changeColumn('historico_task', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: false
    });

    // Remover la clave primaria de id_historico en historico_subtask
    await queryInterface.changeColumn('historico_subtask', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: false
    });
  }
};
