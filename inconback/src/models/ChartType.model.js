const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChartType = sequelize.define('ChartType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada tipo de gráfico debe ser único
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true, // Descripción opcional para el tipo de gráfico
    }
  }, {
    tableName: 'ChartType',
    timestamps: false, // No incluimos createdAt ni updatedAt
  });

  return ChartType;
};
