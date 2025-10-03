const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment_tarea = sequelize.define(
    "Comment_tarea",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      detalle: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      id_task: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileOriginalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Comment_tarea",
      timestamps: true, // Agrega createdAt y updatedAt
      paranoid: true, // Agrega deletedAt para soft delete
    },
  );

  return Comment_tarea;
};
