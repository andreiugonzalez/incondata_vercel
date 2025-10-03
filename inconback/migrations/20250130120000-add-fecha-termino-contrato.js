'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar si la tabla laboral existe
      const tableDescription = await queryInterface.describeTable('laboral');
      console.log('Estructura actual de la tabla laboral:', Object.keys(tableDescription));
      
      // Solo agregar fecha_termino_contrato si no existe
      if (!tableDescription.fecha_termino_contrato) {
        console.log('Agregando columna fecha_termino_contrato a la tabla laboral...');
        await queryInterface.addColumn('laboral', 'fecha_termino_contrato', {
          type: Sequelize.DATEONLY, // En PostgreSQL se convierte a DATE
          allowNull: true,
          comment: 'Fecha de término del contrato laboral'
        }, { transaction });
        console.log('Columna fecha_termino_contrato agregada exitosamente.');
      } else {
        console.log('La columna fecha_termino_contrato ya existe en la tabla laboral.');
      }
      
      await transaction.commit();
      console.log('Migración completada exitosamente.');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error en la migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const tableDescription = await queryInterface.describeTable('laboral');
      
      // Eliminar la columna fecha_termino_contrato si existe
      if (tableDescription.fecha_termino_contrato) {
        console.log('Eliminando columna fecha_termino_contrato de la tabla laboral...');
        await queryInterface.removeColumn('laboral', 'fecha_termino_contrato', { transaction });
        console.log('Columna fecha_termino_contrato eliminada exitosamente.');
      } else {
        console.log('La columna fecha_termino_contrato no existe en la tabla laboral.');
      }
      
      await transaction.commit();
      console.log('Rollback completado exitosamente.');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error en el rollback:', error);
      throw error;
    }
  }
};