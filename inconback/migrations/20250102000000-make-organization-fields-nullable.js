'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hacer los campos email, sitio_web y descripcion opcionales (nullable)
    await queryInterface.changeColumn('organizacion', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('organizacion', 'sitio_web', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('organizacion', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios - hacer los campos obligatorios nuevamente
    await queryInterface.changeColumn('organizacion', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('organizacion', 'sitio_web', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('organizacion', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};