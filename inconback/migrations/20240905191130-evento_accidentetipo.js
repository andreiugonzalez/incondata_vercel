'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('evento', 'id_tipo_accidente', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('evento', 'id_tipo_accidente');
  }
};
