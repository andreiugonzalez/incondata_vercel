'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna con un valor por defecto para filas existentes
    await queryInterface.addColumn('organizacion', 'id_tipoempresa', {
      type: Sequelize.INTEGER,
      allowNull: false, // No permitimos valores nulos
      defaultValue: 1,  // Establece el valor por defecto como 1 (debe existir un registro con id 1 en TipoEmpresa)
      references: {
        model: 'TipoEmpresa',  // Tabla referenciada
        key: 'id_TipoEmpresa',             // Clave primaria de TipoEmpresa
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir la migración eliminando la columna id_tipoempresa
    await queryInterface.removeColumn('organizacion', 'id_tipoempresa');
  }
};
