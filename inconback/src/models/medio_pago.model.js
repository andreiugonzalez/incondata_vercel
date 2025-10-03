const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedioPago = sequelize.define('MedioPago', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'medio_pago'
  });

  return MedioPago;
};
