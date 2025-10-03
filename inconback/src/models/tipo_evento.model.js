// Modelo para la tabla Evento
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const Tipo_evento = sequelize.define('Tipo_evento', {
    id_tipo_evento: {
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
    tableName: 'tipo_evento'

  });


  return Tipo_evento;
};
