'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar clave foránea para userId
    await queryInterface.addConstraint('UserChartSettings', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_user_chart_settings_user', // Nombre de la constraint
      references: {
        table: 'user', // Tabla referenciada
        field: 'id', // Columna referenciada
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Agregar clave foránea para projectId
    await queryInterface.addConstraint('UserChartSettings', {
      fields: ['projectId'],
      type: 'foreign key',
      name: 'fk_user_chart_settings_project', // Nombre de la constraint
      references: {
        table: 'Project', // Tabla referenciada
        field: 'id', // Columna referenciada
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Agregar clave foránea para chartId
    await queryInterface.addConstraint('UserChartSettings', {
      fields: ['chartId'],
      type: 'foreign key',
      name: 'fk_user_chart_settings_chartType', // Nombre de la constraint
      references: {
        table: 'ChartType', // Tabla referenciada
        field: 'id', // Columna referenciada
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar clave foránea para userId
    await queryInterface.removeConstraint('UserChartSettings', 'fk_user_chart_settings_user');

    // Eliminar clave foránea para projectId
    await queryInterface.removeConstraint('UserChartSettings', 'fk_user_chart_settings_project');

    // Eliminar clave foránea para chartId
    await queryInterface.removeConstraint('UserChartSettings', 'fk_user_chart_settings_chartType');
  }
};
