const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Puesto = sequelize.define('Puesto', {
      id_puesto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_puesto: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
},{
    tableName: 'Puesto'
    });

    
  return Puesto;
};
