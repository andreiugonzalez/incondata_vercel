// Modelo para la tabla TipoMaterial
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const TipoMaterial = sequelize.define('TipoMaterial', {
      id_tipomaterial: {
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
        tableName: 'TipoMaterial'
    
    });

    
  return TipoMaterial;
};
