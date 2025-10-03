const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>  {
  const Proyectoproveedor = sequelize.define('Proyectoproveedor', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
  },
    id_proyecto: DataTypes.INTEGER,
    id_organizacion: DataTypes.INTEGER,
  
   
  }, {
    tableName: 'Proyectoproveedor'
  });

  return Proyectoproveedor;
};


