const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const user_login = sequelize.define('user_login', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        login_time: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['success', 'failed']]
            }
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIP: true
            }
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        region: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        session_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        os: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        browser: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        login_method: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        failure_reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        login_attempts: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        successful_attempt: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        is_2fa_used: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        referrer_url: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'user_login',
        timestamps: true
    });

    return user_login;
};
