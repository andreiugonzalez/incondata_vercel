const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
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
      id_partida: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileUrl: {
        // <--- NUEVO
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileOriginalName: {
        // <--- NUEVO
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Comment",
      timiestamps: true, // <--- NUEVO: Agrega createdAt y updatedAt
      paranoid: true, // <--- NUEVO: Agrega deletedAt para soft delete
    },
  );

  return Comment;
};
