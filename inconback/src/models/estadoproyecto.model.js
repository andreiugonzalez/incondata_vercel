// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const EstadoProyecto = sequelize.define('EstadoProyecto', {
      id_estadoproyecto: {
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
    tableName: 'EstadoProyecto'
    });

    
  return EstadoProyecto;
};
