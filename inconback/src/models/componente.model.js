// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Componente = sequelize.define('Componente', {
      id_componente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    } 
},{
    tableName: 'Componente'
    });

    
  return Componente;
};
