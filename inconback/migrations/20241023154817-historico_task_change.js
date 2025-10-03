'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Paso 1: Eliminar la columna id_historico
    await queryInterface.removeColumn('historico_task', 'id_historico');

    // Paso 2: Cambiar id para que sea la clave primaria
    await queryInterface.changeColumn('historico_task', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // En caso de rollback, volvemos a agregar id_historico
    await queryInterface.addColumn('historico_task', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

    // Removemos la clave primaria de id
    await queryInterface.changeColumn('historico_task', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: false
    });
  }
};
