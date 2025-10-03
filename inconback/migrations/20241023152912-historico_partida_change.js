'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Paso 1: Eliminar la clave primaria de id_historico y luego eliminar la columna
    await queryInterface.removeColumn('historico_partida', 'id_historico');

    // Paso 2: Hacer id_partida la nueva clave primaria
    await queryInterface.changeColumn('historico_partida', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // En caso de rollback, volvemos a agregar la columna id_historico con auto-increment
    await queryInterface.addColumn('historico_partida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Removemos la clave primaria de id_partida
    await queryInterface.changeColumn('historico_partida', 'id_partida', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });
  }
};
