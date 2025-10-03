'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Subtask', 'precio_unit', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.changeColumn('Subtask', 'precio_total', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Subtask', 'precio_unit', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('Subtask', 'precio_total', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
