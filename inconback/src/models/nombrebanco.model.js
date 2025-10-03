// Modelo para la tabla NombreBanco
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const NombreBanco = sequelize.define('NombreBanco', {
      id_nombrebanco: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_banco: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },{
        tableName: 'NombreBanco'
    });
  
    return NombreBanco;
  };