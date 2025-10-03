const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoRecurso = sequelize.define('TipoRecurso', {
    id_TipoRecurso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'TipoRecurso'
  });

  return TipoRecurso;
};
