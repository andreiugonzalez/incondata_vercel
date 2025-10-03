'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar si la tabla y columnas existen
      const tableDescription = await queryInterface.describeTable('laboral');
      
      // Solo renombrar si la columna fecha_inicio_actividad existe y fecha_inicio_contrato no existe
      if (tableDescription.fecha_inicio_actividad && !tableDescription.fecha_inicio_contrato) {
        console.log('Renombrando columna fecha_inicio_actividad a fecha_inicio_contrato...');
        await queryInterface.renameColumn('laboral', 'fecha_inicio_actividad', 'fecha_inicio_contrato', { transaction });
      } else {
        console.log('La columna fecha_inicio_actividad ya fue renombrada o fecha_inicio_contrato ya existe.');
      }
      
      // Solo agregar fecha_termino_contrato si no existe
      const updatedTableDescription = await queryInterface.describeTable('laboral');
      if (!updatedTableDescription.fecha_termino_contrato) {
        console.log('Agregando columna fecha_termino_contrato...');
        await queryInterface.addColumn('laboral', 'fecha_termino_contrato', {
          type: Sequelize.DATEONLY,
          allowNull: true
        }, { transaction });
      } else {
        console.log('La columna fecha_termino_contrato ya existe.');
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
        console.log('Eliminando columna fecha_termino_contrato...');
        await queryInterface.removeColumn('laboral', 'fecha_termino_contrato', { transaction });
      }
      
      // Renombrar de vuelta si fecha_inicio_contrato existe y fecha_inicio_actividad no existe
      const updatedTableDescription = await queryInterface.describeTable('laboral');
      if (updatedTableDescription.fecha_inicio_contrato && !updatedTableDescription.fecha_inicio_actividad) {
        console.log('Renombrando columna fecha_inicio_contrato a fecha_inicio_actividad...');
        await queryInterface.renameColumn('laboral', 'fecha_inicio_contrato', 'fecha_inicio_actividad', { transaction });
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