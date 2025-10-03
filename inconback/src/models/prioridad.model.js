// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Prioridad = sequelize.define('Prioridad', {
      id_prioridad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_prioridad: {
        type: DataTypes.STRING(100),
        allowNull: false
    } 
},{
    tableName: 'Prioridad'
    });

    
  return Prioridad;
};
