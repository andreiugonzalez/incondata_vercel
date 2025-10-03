'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Quitar la restricción de NOT NULL temporalmente
    await queryInterface.sequelize.query('ALTER TABLE "Material" ALTER COLUMN "id_subtask" DROP NOT NULL;');

    // Ajustar las referencias para permitir valores nulos si es necesario
    await queryInterface.changeColumn('Material', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Subtask',
        key: 'id_subtask'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el cambio y restaurar NOT NULL en caso de deshacer la migración
    await queryInterface.changeColumn('Material', 'id_subtask', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Subtask',
        key: 'id_subtask'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
