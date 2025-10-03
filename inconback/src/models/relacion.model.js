// Modelo para la tabla NombreBanco
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Relacion = sequelize.define('Relacion', {
      id_relacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },{
        tableName: 'Relacion'
    });
  
    return Relacion;
  };