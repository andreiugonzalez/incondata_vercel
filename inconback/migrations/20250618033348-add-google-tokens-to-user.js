"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("user", "google_access_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("user", "google_refresh_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("user", "google_access_token");
    await queryInterface.removeColumn("user", "google_refresh_token");
  },
};
