'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('OptionImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      OptionId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Options",
          key: 'id',
        },
        onDelete: "SET NULL"
      },
      ProjectId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Projects",
          key: 'id'
        },
        onDelete: "SET NULL"
      },
      url: {
        type: Sequelize.TEXT
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
    return queryInterface.dropTable('OptionImages');
  }
};
