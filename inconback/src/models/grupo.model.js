const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Grupo = sequelize.define('Grupo', {
      id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_grupo: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
},{
    tableName: 'Grupo'
    });

    
  return Grupo;
};
