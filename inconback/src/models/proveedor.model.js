const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proveedor = sequelize.define('Proveedor', {
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_empresa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre_representante: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },
    
      id_tipo_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },
      id_codtelefono: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },

      
      
  }, {
    tableName: 'Proveedor'
  });

 

  return Proveedor;
};
