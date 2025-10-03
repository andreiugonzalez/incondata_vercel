// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Unidad = sequelize.define('Unidad', {
      id_unidad: {
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
    tableName: 'Unidad'
    });

    
  return Unidad;
};
