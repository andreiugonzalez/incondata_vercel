'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('document', 'trashed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('document', 'updatable', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('document', 'trashedAt', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('document', 'trashed');
    await queryInterface.removeColumn('document', 'updatable');
    await queryInterface.removeColumn('document', 'trashedAt');
  }
};
