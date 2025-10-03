const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Laboral = sequelize.define('Laboral', {
    id_laboral: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fecha_inicio_actividad: { // Corregido: usar el nombre real de la columna
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // Removido fecha_termino_contrato ya que no existe en la BD
    sueldo_base: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    gratificacion: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    valor_hora: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_ingreso_obra: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Cargo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    tipo_contrato_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    medio_pago_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'laboral'
  });

  Laboral.associate = (models) => {
    Laboral.hasOne(models.Externo, {
      foreignKey: 'laboral_id',
      as: 'externo',
    });
  };

  return Laboral;
};
