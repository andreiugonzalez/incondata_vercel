module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

      id_proyecto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // references: { model: "proyecto", key: "id" }, // Descomenta si tienes la tabla proyecto
      },
      // Si quieres agregar adjuntos, puedes agregar un campo JSON o similar
      // attachments: {
      //   type: DataTypes.JSON,
      //   allowNull: true,
      // },
    },
    {
      tableName: "message",
      timestamps: true, // createdAt y updatedAt
    },
  );

  // Relaciones (opcional, si usas asociaciones en Sequelize)
  Message.associate = function (models) {
    Message.belongsTo(models.User, {
      as: "fromUser",
      foreignKey: "fromUserId",
    });
    Message.belongsTo(models.User, { as: "toUser", foreignKey: "toUserId" });
    Message.belongsTo(models.Project, {
      as: "proyecto",
      foreignKey: "id_proyecto",
    });
  };

  return Message;
};
