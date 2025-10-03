'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Tipo_accidente', [
      {
        id_tipo_accidente: 1,
        nombre: "Leve",
        createdAt: new Date(),
        updatedAt: new Date()
    }
    ,
    {
        id_tipo_accidente: 2,
        nombre: "Grave",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id_tipo_accidente: 3,
        nombre: "Fatal",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tipo_accidente', null, {});
  }
};
