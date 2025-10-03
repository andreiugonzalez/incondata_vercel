// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Region = sequelize.define('Region', {
      id_region: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      id_pais: {
        type: DataTypes.INTEGER,
        allowNull: false
    } 
},{
    tableName: 'Region'
    });

    
  return Region;
};
