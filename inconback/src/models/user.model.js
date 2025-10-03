const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido_p: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido_m: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordExpirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isTemporaryPassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
          isEmail: { msg: "Debe ser un correo válido" },
        },
      },
      // google_access_token: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // google_refresh_token: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      genero: {
        type: DataTypes.ENUM("Femenino", "Masculino"),
        allowNull: false,
      },
      fecha_de_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      telefono: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codigo_postal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rut: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organizacionid: {
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      puesto: {
        type: DataTypes.STRING,
      },
      ultimo_acceso: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        get() {
          const date = this.getDataValue("ultimo_acceso");

          if (!date) {
            return "No ha accedido";
          }

          try {
            // Para fechas DATEONLY, simplemente devolvemos la cadena de fecha tal como está
            // ya que está en formato YYYY-MM-DD y no necesita ajustes de zona horaria
            return date;
          } catch (error) {
            console.error("Error al procesar fecha:", error);
            return "No ha accedido";
          }
        },
      },
      ID_comuna: {
        type: DataTypes.INTEGER,
      },
      id_salud: {
        type: DataTypes.INTEGER,
      },
      id_estado_cuenta: {
        type: DataTypes.INTEGER,
      },
      id_estado_civil: {
        type: DataTypes.INTEGER,
      },
      id_cod_telf: {
        type: DataTypes.INTEGER,
      },
      id_afp: {
        type: DataTypes.INTEGER,
      },
      id_grupo: {
        type: DataTypes.INTEGER,
      },
      id_puesto: {
        type: DataTypes.INTEGER,
      },
      urifolder: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      storage_limit: {
        type: DataTypes.BIGINT,
        defaultValue: 10 * 1024 * 1024 * 1024, // 10 GB en bytes
        allowNull: false,
      },
      replacedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "user",
    },
  );

  User.associate = (models) => {
    User.hasOne(models.Externo, {
      foreignKey: "id_usuario",
      as: "externo",
    });
    User.hasOne(models.Interno, {
      foreignKey: "id_usuario",
      as: "interno",
    });
    User.hasMany(models.UserRol, {
      foreignKey: "userId",
      as: "userRoles",
    });
  };

  return User;
};
