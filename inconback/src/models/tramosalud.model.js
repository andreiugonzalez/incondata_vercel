const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TramoSalud = sequelize.define('TramoSalud', {
    id_tramoSalud: {
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
    tableName: 'TramoSalud'
  });

  return TramoSalud;
};
