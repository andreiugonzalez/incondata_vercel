const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const historico_task = sequelize.define('historico_task', {
    id_historico: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cantidad_normal: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad_acumulada: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad_parcial: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    porcentaje: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    horas_hombre: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    horas_maquina: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_EstadoTarea: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
   id_subpartida: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_unidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    telefono_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email_user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
      validate: {
        isEmail: { msg: 'Debe ser un correo válido' }
      },

    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_termino: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    avance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    prioridad: {
      type: DataTypes.INTEGER,
      allowNull: false
    }


  }, {
    tableName: 'historico_task'
  });

  return historico_task;
};
