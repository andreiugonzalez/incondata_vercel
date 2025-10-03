'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna 'country'
    await queryInterface.addColumn('user_login', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar la columna 'region'
    await queryInterface.addColumn('user_login', 'region', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar la columna 'city'
    await queryInterface.addColumn('user_login', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar la columna 'latitude'
    await queryInterface.addColumn('user_login', 'latitude', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar la columna 'longitude'
    await queryInterface.addColumn('user_login', 'longitude', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna 'country'
    await queryInterface.removeColumn('user_login', 'country');

    // Eliminar la columna 'region'
    await queryInterface.removeColumn('user_login', 'region');

    // Eliminar la columna 'city'
    await queryInterface.removeColumn('user_login', 'city');

    // Eliminar la columna 'latitude'
    await queryInterface.removeColumn('user_login', 'latitude');

    // Eliminar la columna 'longitude'
    await queryInterface.removeColumn('user_login', 'longitude');
  }
};
