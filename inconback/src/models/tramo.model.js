// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Tramo = sequelize.define('Tramo', {
      id_tramo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_tramo: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
},{
    tableName: 'Tramo'
    });

    
  return Tramo;
};
