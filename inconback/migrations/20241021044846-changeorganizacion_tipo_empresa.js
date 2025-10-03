'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('organizacion', 'id_tipoempresa', {
      type: Sequelize.INTEGER,
      allowNull: false, // No permitir null si es necesario
      defaultValue: null // Elimina el valor por defecto
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el cambio en caso de necesitarlo
    return queryInterface.changeColumn('organizacion', 'id_tipoempresa', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1 // Si quieres volver a agregar el valor por defecto
    });
  }
};
