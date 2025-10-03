'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('document', 'filesize', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('document', 'filesize', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
