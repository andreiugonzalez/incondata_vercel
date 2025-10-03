'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar la clave foránea Material_id_organizacion_fkey1 de la tabla Material
    await queryInterface.removeConstraint('Material', 'Material_id_organizacion_fkey1');
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar la clave foránea Material_id_organizacion_fkey1 si se revierte la migración
    await queryInterface.addConstraint('Material', {
      fields: ['id_organizacion'], // El campo en Material que actúa como clave foránea
      type: 'foreign key',
      name: 'Material_id_organizacion_fkey1', // Nombre del constraint a restaurar
      references: {
        table: 'organizacion',  // Tabla referenciada
        field: 'id',            // Clave primaria referenciada
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
};
