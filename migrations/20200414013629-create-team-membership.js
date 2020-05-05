'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TeamMemberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role: {
        type: Sequelize.STRING
      },
      TeamId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Teams",
          key: 'id',
        },
        onDelete: "SET NULL"
      },
      UserId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Users",
          key: 'id',
        },
        onDelete: "SET NULL"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TeamMemberships');
  }
};
