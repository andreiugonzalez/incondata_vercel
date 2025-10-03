// Modelo para la tabla Evento
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const Evento = sequelize.define('Evento', {
    id_evento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_inc: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notification: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_evento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_capacitacion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tipo_accidente: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'evento'

  });


  return Evento;
};
