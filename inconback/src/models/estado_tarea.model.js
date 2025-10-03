// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const EstadoTarea = sequelize.define('EstadoTarea', {
      id_EstadoTarea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      NombreEstadoTarea: {
        type: DataTypes.STRING(100),
        allowNull: false
    } 
},{
    tableName: 'EstadoTarea'
    });

    
  return EstadoTarea;
};
