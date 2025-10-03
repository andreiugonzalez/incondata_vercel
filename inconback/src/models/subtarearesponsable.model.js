const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>  {
  const SubTareaResponsable = sequelize.define('SubTareaResponsable', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
  },
    id_usuario: DataTypes.INTEGER,
    id_subtask: DataTypes.INTEGER,
  
   
  }, {
    tableName: 'SubTareaResponsable'
  });

  return SubTareaResponsable;
};


