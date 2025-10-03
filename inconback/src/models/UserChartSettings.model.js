const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserChartSettings = sequelize.define('UserChartSettings', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chartId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    }
  }, {
    tableName: 'UserChartSettings',
    timestamps: true, // Sequelize agregará automáticamente `createdAt` y `updatedAt`
  });

  return UserChartSettings;
};
