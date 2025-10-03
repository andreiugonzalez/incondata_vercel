// estadoCuenta.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoCuenta = sequelize.define('EstadoCuenta', {
    id_estado_cuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_estado_cuenta: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'estado_cuenta',
    timestamps: false
  });

  return EstadoCuenta;
};
