'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Paso 1: Eliminar la columna id_historico
    await queryInterface.removeColumn('historico_subtask', 'id_historico');

    // Paso 2: Cambiar id_subpartida para que sea la clave primaria
    await queryInterface.changeColumn('historico_subtask', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // En caso de rollback, volvemos a agregar id_historico
    await queryInterface.addColumn('historico_subtask', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Removemos la clave primaria de id_subpartida
    await queryInterface.changeColumn('historico_subtask', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });
  }
};
