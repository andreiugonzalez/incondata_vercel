// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Comuna = sequelize.define('Comuna', {
      id_comuna: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      id_region: {
        type: DataTypes.INTEGER,
        allowNull: false
    } 
},{
    tableName: 'Comuna'
    });

    
  return Comuna;
};
