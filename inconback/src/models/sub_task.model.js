const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subtask = sequelize.define('Subtask', {
    id_subtask: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cantidad_norma: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad_acumu: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad_parci: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    porcentaje: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    precio_unit: {
      type: DataTypes.FLOAT,
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
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_task: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_material: {
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
    tableName: 'Subtask'
  });

  return Subtask;
};
