// estadoCivil.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoCivil = sequelize.define('EstadoCivil', {
    id_estado_civil: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_estado_civil: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'estado_civil'
  });

  return EstadoCivil;
};
