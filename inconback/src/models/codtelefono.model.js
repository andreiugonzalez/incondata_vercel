const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CodTelefono = sequelize.define('CodTelefono', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    cod_numero: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'CodTelefono'
  });

  return CodTelefono;
};
