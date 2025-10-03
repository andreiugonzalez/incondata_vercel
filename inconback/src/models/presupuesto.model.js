// presupuesto.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Presupuesto = sequelize.define('Presupuesto', {
    id_presupuesto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_presupuesto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_recurso: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    monto_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    categoria_gasto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comentarios: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    proyecto_id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_recurso_id_tipo_recurso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_costo_id_tipo_costo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Presupuesto',
    
  });

  return Presupuesto;
};
