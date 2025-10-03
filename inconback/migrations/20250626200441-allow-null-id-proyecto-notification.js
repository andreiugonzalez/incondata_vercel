"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("notification", "id_proyecto", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("notification", "id_proyecto", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
