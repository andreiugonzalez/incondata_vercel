// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Interno = sequelize.define('Interno', {
    
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    },{
        tableName: 'Interno'
    
    });

    Interno.associate = (models) => {
      Interno.belongsTo(models.User, {
        foreignKey: 'id_usuario',
        as: 'user',
        onDelete: 'CASCADE',
      });
    };

    
  return Interno;
};
