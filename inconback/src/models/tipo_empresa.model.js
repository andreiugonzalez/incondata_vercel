const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoEmpresa = sequelize.define('TipoEmpresa', {
    id_TipoEmpresa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }, {
    tableName: 'TipoEmpresa'
  });

  return TipoEmpresa;
};


