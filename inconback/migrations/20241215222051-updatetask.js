module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Task', 'precio_unit', {
      type: Sequelize.BIGINT,
      allowNull: false
    });
    await queryInterface.changeColumn('Task', 'precio_total', {
      type: Sequelize.BIGINT,
      allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Task', 'precio_unit', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.changeColumn('Task', 'precio_total', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
