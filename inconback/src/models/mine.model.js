const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mine = sequelize.define('Mine', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }, 
    giro_mina: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    id_comuna: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_organizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
  },
  {
    tableName: 'Mine'
  });

  return Mine;
};
