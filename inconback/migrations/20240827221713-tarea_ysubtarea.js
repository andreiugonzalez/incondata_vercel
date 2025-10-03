'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar el tipo de dato de la columna 'cantidad' de INTEGER a FLOAT en SubPartida
    await queryInterface.changeColumn('Task', 'cantidad', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Cambiar el tipo de dato de la columna 'cantidad' de INTEGER a FLOAT en Tarea
    await queryInterface.changeColumn('Subtask', 'cantidad', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir el cambio de la columna 'cantidad' en SubPartida
    await queryInterface.changeColumn('Task', 'cantidad', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Revertir el cambio de la columna 'cantidad' en Tarea
    await queryInterface.changeColumn('Subtask', 'cantidad', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
