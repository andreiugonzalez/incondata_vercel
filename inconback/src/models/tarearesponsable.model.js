const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TareaResponsable = sequelize.define('TareaResponsable', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
  },id_usuario:{
      type: DataTypes.INTEGER,
  },
    id_tarea:{
      type: DataTypes.INTEGER,
  }
   
  }, {
    tableName: 'TareaResponsable'
  });

  return TareaResponsable;
};


