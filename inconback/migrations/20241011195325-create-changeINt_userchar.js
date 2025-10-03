'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar la tabla 'UserChartSettings' si ya existe
    await queryInterface.dropTable('UserChartSettings');

    // Crear la tabla nuevamente con las configuraciones correctas
    await queryInterface.createTable('UserChartSettings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      chartId: {
        type: Sequelize.INTEGER, // Cambiado a INTEGER
        allowNull: false,
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
    }, {
      timestamps: true, // Sequelize generará automáticamente `createdAt` y `updatedAt`
    });
  },

  down: async (queryInterface, Sequelize) => {
    // En caso de revertir, eliminar la tabla
    await queryInterface.dropTable('UserChartSettings');
  }
};
