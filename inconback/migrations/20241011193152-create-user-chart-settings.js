'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserChartSettings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
        type: Sequelize.STRING,
        allowNull: false
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserChartSettings');
  }
};
