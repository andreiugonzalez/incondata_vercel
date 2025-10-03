// Modelo para la tabla Banco
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const Banco = sequelize.define('Banco', {
      id_banco: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      num_cuenta: {
        type: DataTypes.STRING,
        allowNull: false
      },
      correo: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      id_tipo_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
      ,

      id_nombrebanco: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },{
        tableName: 'Banco'

    });

    Banco.associate = (models) => {
      Banco.hasOne(models.Externo, {
        foreignKey: 'banco_id',
        as: 'externo',
      });
    };


  return Banco;
};
