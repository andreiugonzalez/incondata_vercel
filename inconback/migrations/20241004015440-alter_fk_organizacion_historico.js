'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna id_organizacion a la tabla Material como clave foránea
    await queryInterface.addColumn('HistoricoMaterial', 'id_organizacion', {
      type: Sequelize.INTEGER,
      allowNull: false, // No permitir valores nulos
      defaultValue: 1,  // Valor por defecto temporalmente para asignar un valor a las filas existentes
      references: {
        model: 'organizacion',  // Tabla referenciada
        key: 'id',              // Clave primaria de organizacion
      },
      onDelete: 'CASCADE',       // Reglas de borrado en cascada
      onUpdate: 'CASCADE',       // Reglas de actualización en cascada
    });

    // Eliminar la columna id_proveedor de la tabla Material
    await queryInterface.removeColumn('HistoricoMaterial', 'id_proveedor');

    // Eliminar el valor por defecto de la columna id_organizacion después de asignar los valores
    await queryInterface.changeColumn('HistoricoMaterial', 'id_organizacion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'organizacion',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir la eliminación de la columna id_proveedor (si es necesario, añade más detalles si tienes requisitos específicos)
    await queryInterface.addColumn('HistoricoMaterial', 'id_proveedor', {
      type: Sequelize.INTEGER,
    });

    // Eliminar la columna id_organizacion de la tabla Material
    await queryInterface.removeColumn('HistoricoMaterial', 'id_organizacion');
  }
};
