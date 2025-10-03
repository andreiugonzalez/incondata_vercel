"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("message", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("message", "fileOriginalName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("message", "fileUrl");
    await queryInterface.removeColumn("message", "fileOriginalName");
  },
};
