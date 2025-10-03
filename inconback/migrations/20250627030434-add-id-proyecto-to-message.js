"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("message", "id_proyecto", {
      type: Sequelize.INTEGER,
      allowNull: true,
      // references: { model: 'proyecto', key: 'id' }, // Descomenta si tienes la tabla proyecto
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("message", "id_proyecto");
  },
};
