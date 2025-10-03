const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotaTrabajoEvento = sequelize.define('NotaTrabajoEvento', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nota: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileOriginalName: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'NotaTrabajoEvento',
    timestamps: true, 
    paranoid: true,
  });

  return NotaTrabajoEvento;
};
