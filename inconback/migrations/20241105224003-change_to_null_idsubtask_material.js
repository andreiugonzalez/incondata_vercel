'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Material', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Subtask', // Asegúrate de que el nombre de la tabla esté correcto
        key: 'id_subtask'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Material', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Subtask', // Asegúrate de que el nombre de la tabla esté correcto
        key: 'id_subtask'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
