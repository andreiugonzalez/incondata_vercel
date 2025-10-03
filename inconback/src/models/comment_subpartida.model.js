const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment_subpartida = sequelize.define(
    "Comment_subpartida",
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
      id_subpartida: {
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
      tableName: "Comment_subpartida",
      timestamps: true, // Agrega createdAt y updatedAt
      paranoid: true, // Agrega deletedAt para soft delete
    },
  );

  return Comment_subpartida;
};
