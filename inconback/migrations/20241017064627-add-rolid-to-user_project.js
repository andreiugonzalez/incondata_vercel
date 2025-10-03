'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_project', 'rolId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Asignar valor inicial de 1
      references: {
        model: 'rol', // Nombre de la tabla referenciada
        key: 'id' // Llave primaria de la tabla referenciada
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // o 'CASCADE' si deseas eliminar los user_project relacionados
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_project', 'rolId');
  }
};
