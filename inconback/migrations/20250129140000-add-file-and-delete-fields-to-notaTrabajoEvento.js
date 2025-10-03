'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Agregar columnas para archivos adjuntos
      await queryInterface.addColumn(
        'NotaTrabajoEvento',
        'fileUrl',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      
      await queryInterface.addColumn(
        'NotaTrabajoEvento',
        'fileOriginalName',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      
      // Agregar columna para eliminación lógica
      await queryInterface.addColumn(
        'NotaTrabajoEvento',
        'deletedAt',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('NotaTrabajoEvento', 'fileUrl', { transaction });
      await queryInterface.removeColumn('NotaTrabajoEvento', 'fileOriginalName', { transaction });
      await queryInterface.removeColumn('NotaTrabajoEvento', 'deletedAt', { transaction });
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}; 