const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoContrato = sequelize.define('TipoContrato', {
    tipo_contrato_id: {
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
    tableName: 'TipoContrato'
  });

  return TipoContrato;
};
