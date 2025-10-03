const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      resumen: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      id_proyecto: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      readBy: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      deletedBy: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      newFor: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "notification",
    },
  );

  return Notification;
};
