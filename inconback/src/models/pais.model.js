// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Pais = sequelize.define('Pais', {
      id_pais: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      NombrePais: {
        type: DataTypes.STRING(100),
        allowNull: false
    } 
},{
    tableName: 'Pais'
    });

    
  return Pais;
};
