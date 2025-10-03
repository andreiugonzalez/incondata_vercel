'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Inserta los 3 tipos de gráficos con los nombres en español
    await queryInterface.bulkInsert('ChartType', [
      {
        name: 'HorasHombreVsHorasMaquina',
        description: 'Gráfico que muestra la cantidad de horas hombre y horas máquina trabajadas en el proyecto'
      },
      {
        name: 'EstadoPrevencionOAccidente',
        description: 'Muestra el estado de los accidentes o las medidas de prevención en el proyecto'
      },
      {
        name: 'AsignacionPersonalPorCargo',
        description: 'Muestra la cantidad de personal asignado según los roles o cargos dentro del proyecto'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina los registros si se hace un rollback
    await queryInterface.bulkDelete('ChartType', null, {});
  }
};
