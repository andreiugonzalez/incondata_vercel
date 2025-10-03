'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
 




    await queryInterface.addColumn('Material', 'id_task', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Task', // Nombre de la tabla de Tarea
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

  
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('Material', 'id_subpartida');
    await queryInterface.removeColumn('Material', 'id_tarea');

  }
};
