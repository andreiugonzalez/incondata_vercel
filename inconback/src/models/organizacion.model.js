const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organizacion = sequelize.define('Organizacion', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_codtelefono: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    representante_legal: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rut_representante_legal: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_comuna: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_tipoempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sitio_web: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'organizacion'
  });

  return Organizacion;
};
