"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comment_subpartida", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment_subpartida", "fileOriginalName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment_tarea", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment_tarea", "fileOriginalName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment_subtarea", "fileUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Comment_subtarea", "fileOriginalName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comment_subpartida", "fileUrl");
    await queryInterface.removeColumn("Comment_subpartida", "fileOriginalName");
    await queryInterface.removeColumn("Comment_tarea", "fileUrl");
    await queryInterface.removeColumn("Comment_tarea", "fileOriginalName");
    await queryInterface.removeColumn("Comment_subtarea", "fileUrl");
    await queryInterface.removeColumn("Comment_subtarea", "fileOriginalName");
  },
};
