'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna id_organizacion a la tabla Proyectoproveedor como clave foránea
    await queryInterface.addColumn('Proyectoproveedor', 'id_organizacion', {
      type: Sequelize.INTEGER,
      allowNull: false, // No permitir valores nulos
      references: {
        model: 'organizacion',  // Tabla referenciada
        key: 'id',              // Clave primaria de organizacion
      },
      onDelete: 'CASCADE',       // Reglas de borrado en cascada
      onUpdate: 'CASCADE',       // Reglas de actualización en cascada
    });

    // Eliminar la columna id_proveedor de la tabla Proyectoproveedor
    await queryInterface.removeColumn('Proyectoproveedor', 'id_proveedor');
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir la eliminación de la columna id_proveedor
    await queryInterface.addColumn('Proyectoproveedor', 'id_proveedor', {
      type: Sequelize.INTEGER,
    });

    // Eliminar la columna id_organizacion
    await queryInterface.removeColumn('Proyectoproveedor', 'id_organizacion');
  }
};
