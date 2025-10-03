'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'google_access_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('user', 'google_refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'google_access_token');
    await queryInterface.removeColumn('user', 'google_refresh_token');
  }
};
