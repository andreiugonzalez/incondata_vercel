const { DataTypes } = require('sequelize');
// Modelo para la tabla TipoCuenta
module.exports = (sequelize) => {
    const TipoCuenta = sequelize.define('TipoCuenta', {
      id_tipo_cuenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      autoIncrement: true
       
      },
      nombre_tipo: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
  tableName: 'TipoCuenta'
    });
  
    return TipoCuenta;
  };
  