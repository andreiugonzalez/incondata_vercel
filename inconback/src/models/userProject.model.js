const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const user_project = sequelize.define('user_project', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            
          }
          
    }, {
        tableName: 'user_project'
    });

    return user_project;
};
