'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Eliminar la clave foránea organizacion_id_fkey de la tabla organizacion
      await queryInterface.removeConstraint('organizacion', 'organizacion_id_fkey');
      console.log('Constraint organizacion_id_fkey eliminada correctamente.');
    } catch (error) {
      console.error('Error eliminando constraint organizacion_id_fkey:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Restaurar la clave foránea organizacion_id_fkey en caso de revertir la migración
      await queryInterface.addConstraint('organizacion', {
        fields: ['organizacion_id'], // El campo que hace referencia
        type: 'foreign key',
        name: 'organizacion_id_fkey', // Restaurar el nombre de la constraint
        references: {
          table: 'CodTelefono', // Tabla referenciada
          field: 'id'           // Campo referenciado
        },
        onDelete: 'CASCADE',  // Regla de borrado
        onUpdate: 'CASCADE'   // Regla de actualización
      });
      console.log('Constraint organizacion_id_fkey restaurada correctamente.');
    } catch (error) {
      console.error('Error restaurando constraint organizacion_id_fkey:', error);
    }
  }
};
