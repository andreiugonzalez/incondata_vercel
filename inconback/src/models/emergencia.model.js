const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Emergencia = sequelize.define('Emergencia', {
    id_emergencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre_contacto: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
    ,
    cod_telefono: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
    ,
    telefono: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    id_relacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Emergencia'
  });

  return Emergencia;
};
