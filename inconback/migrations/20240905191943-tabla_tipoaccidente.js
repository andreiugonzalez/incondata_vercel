'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tipo_accidente', {
      id_tipo_accidente: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      }

    });
    await queryInterface.bulkInsert('Tipo_accidente', [
      {
        id_tipo_accidente: 1,
        nombre: "Leve"
    }
    ,
    {
        id_tipo_accidente: 2,
        nombre: "Grave"
    },
    {
        id_tipo_accidente: 3,
        nombre: "Fatal"
    },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tipo_accidente', null, {});
    await queryInterface.dropTable('Tipo_accidente');
  }
};
