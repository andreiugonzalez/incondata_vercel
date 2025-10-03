// Material.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Material = sequelize.define('Material', {
    id_Material: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_Material: {
      type: DataTypes.STRING(100),
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
    utilizacion: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    perdida: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    perdidas: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    id_tipomaterial: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_organizacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    }, id_partida: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subpartida: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_task: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subtask: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    tableName: 'Material',
    timestamps: true
  });

  return Material;
};
