const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const user_rol = sequelize.define('user_rol', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
        },
        rolId: {
            type: DataTypes.INTEGER,
        }
    }, {
        tableName: 'user_rol'
    });

    return user_rol;
};


