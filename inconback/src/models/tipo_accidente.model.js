// Modelo para la tabla Tipo_capacitacion
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const Tipo_accidente = sequelize.define('Tipo_accidente', {
    id_tipo_accidente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'Tipo_accidente'

  });


  return Tipo_accidente;
};
