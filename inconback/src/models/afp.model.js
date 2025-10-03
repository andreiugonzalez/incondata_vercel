// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Afp = sequelize.define('Afp', {
      id_afp: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      nombre_afp: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
},{
    tableName: 'Afp'
    });

    
  return Afp;
};
