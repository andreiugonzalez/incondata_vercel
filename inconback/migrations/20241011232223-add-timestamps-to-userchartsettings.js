'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar la columna createdAt si ya existe
    const tableDescription = await queryInterface.describeTable('UserChartSettings');
    if (tableDescription.createdAt) {
      await queryInterface.removeColumn('UserChartSettings', 'createdAt');
    }

    // Agregar la columna createdAt nuevamente
    await queryInterface.addColumn('UserChartSettings', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Valor predeterminado actual
    });

    // Agregar la columna updatedAt
    await queryInterface.addColumn('UserChartSettings', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Valor predeterminado actual
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'), // Para PostgreSQL, usamos esta opción
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna createdAt
    await queryInterface.removeColumn('UserChartSettings', 'createdAt');

    // Eliminar la columna updatedAt
    await queryInterface.removeColumn('UserChartSettings', 'updatedAt');
  }
};
