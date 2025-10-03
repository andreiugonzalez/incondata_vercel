// Modelo para la tabla Tipo_capacitacion
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const Tipo_capacitacion = sequelize.define('Tipo_capacitacion', {
    id_tipo_capacitacion: {
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
    tableName: 'tipo_capacitacion'

  });


  return Tipo_capacitacion;
};
