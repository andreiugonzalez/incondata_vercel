'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Revertir cambios en historico_partida: Volver a agregar id_historico y quitar la clave primaria de id_partida
    await queryInterface.addColumn('historico_partida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });


    // Revertir cambios en historico_subpartida: Volver a agregar id_historico y quitar la clave primaria de id_subpartida
    await queryInterface.addColumn('historico_subpartida', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });


    // Revertir cambios en historico_task: Volver a agregar id_historico y quitar la clave primaria de id
    await queryInterface.addColumn('historico_task', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });


    // Revertir cambios en historico_subtask: Volver a agregar id_historico y quitar la clave primaria de id_subtask
    await queryInterface.addColumn('historico_subtask', 'id_historico', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });

  },

  down: async (queryInterface, Sequelize) => {
    // Volver a eliminar id_historico y restaurar las claves primarias en las columnas correspondientes

    // historico_partida: Eliminar id_historico y hacer id_partida la clave primaria nuevamente
    await queryInterface.removeColumn('historico_partida', 'id_historico');
 

    // historico_subpartida: Eliminar id_historico y hacer id_subpartida la clave primaria nuevamente
    await queryInterface.removeColumn('historico_subpartida', 'id_historico');
 

    // historico_task: Eliminar id_historico y hacer id la clave primaria nuevamente
    await queryInterface.removeColumn('historico_task', 'id_historico');
 

    // historico_subtask: Eliminar id_historico y hacer id_subtask la clave primaria nuevamente
    await queryInterface.removeColumn('historico_subtask', 'id_historico');

  }
};
