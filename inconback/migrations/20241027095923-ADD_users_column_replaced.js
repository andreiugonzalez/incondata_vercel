'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'replacedByUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('user', {
      fields: ['replacedByUserId'],
      type: 'foreign key',
      name: 'fk_user_replacedByUserId', // Nombre de la clave foránea
      references: {
        table: 'user',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('user', 'fk_user_replacedByUserId');
    await queryInterface.removeColumn('user', 'replacedByUserId');
  }
};
