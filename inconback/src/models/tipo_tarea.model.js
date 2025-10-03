// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const TipoTarea = sequelize.define('TipoTarea', {
      id_TipoTarea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      NombreTipoTarea: {
        type: DataTypes.STRING(100),
        allowNull: false
    } 
},{
    tableName: 'TipoTarea'
    });

    
  return TipoTarea;
};
