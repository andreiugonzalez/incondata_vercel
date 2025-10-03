'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_login', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Puedes agregar la referencia a la tabla `User` si es necesario
        // references: {
        //   model: 'users',
        //   key: 'id'
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE'
      },
      login_time: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['success', 'failed']]
        }
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIP: true
        }
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      login_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      successful_attempt: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_2fa_used: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      referrer_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_login');
  }
};
