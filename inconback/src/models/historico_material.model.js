// Material.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistoricoMaterial = sequelize.define('HistoricoMaterial', {
    id_historicomaterial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_Material: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    valor_unitario: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    valor_neto: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    valor_bruto: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    valor_total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    id_tipomaterial: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_organizacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
    ,
    id_subtask: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_unidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_componente: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'HistoricoMaterial',
    timestamps: true
  });

  return HistoricoMaterial;
};
