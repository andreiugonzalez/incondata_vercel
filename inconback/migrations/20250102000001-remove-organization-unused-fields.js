'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar las columnas email, sitio_web y descripcion de la tabla organizacion
    await queryInterface.removeColumn('organizacion', 'email');
    await queryInterface.removeColumn('organizacion', 'sitio_web');
    await queryInterface.removeColumn('organizacion', 'descripcion');
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios - agregar las columnas nuevamente
    await queryInterface.addColumn('organizacion', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('organizacion', 'sitio_web', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('organizacion', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};