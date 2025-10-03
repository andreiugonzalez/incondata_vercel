"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comment", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment", "fileOriginalName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comment", "fileUrl");
    await queryInterface.removeColumn("Comment", "fileOriginalName");
  },
};
