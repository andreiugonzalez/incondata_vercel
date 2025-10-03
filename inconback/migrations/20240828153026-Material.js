'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar el tipo de dato de la columna 'cantidad' de INTEGER a FLOAT
    await queryInterface.changeColumn('Material', 'cantidad', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir el cambio si es necesario (volver a INTEGER)
    await queryInterface.changeColumn('Material', 'cantidad', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
