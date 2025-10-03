// Modelo para la tabla Banco
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Externo = sequelize.define(
    "Externo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      laboral_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      banco_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Externo",
    },
  );

  Externo.associate = (models) => {
    Externo.belongsTo(models.User, {
      foreignKey: "id_usuario",
      as: "user",
      onDelete: "CASCADE",
    });
    Externo.belongsTo(models.Laboral, {
      foreignKey: "laboral_id",
      as: "laboral",
      onDelete: "CASCADE",
    });
    Externo.belongsTo(models.Banco, {
      foreignKey: "banco_id",
      as: "banco",
      onDelete: "CASCADE",
    });
  };

  return Externo;
};
