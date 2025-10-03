const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_termino: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    duenio: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    informador: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    presupuesto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codigo_bip: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nombre_unidad_tecnica: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total_general: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    geolocalizacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    monto_total_bruto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    monto_neto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    monto_mensual: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rut_unidad_tecnica: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rut_empresa: {
      type: DataTypes.STRING,
    },
    id_estadoproyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_mina: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: 'Project'
  });

  return Project;
};
