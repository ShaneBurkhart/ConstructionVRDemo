'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      SelectionId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Selections",
          key: 'id',
        },
        onDelete: "SET NULL"
      },
      ProjectId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Projects",
          key: 'id',
        },
        onDelete: "SET NULL"
      },
      name: {
        type: Sequelize.STRING
      },
      unitPrice: {
        type: Sequelize.DECIMAL
      },
      type: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.TEXT
      },
      info: {
        type: Sequelize.TEXT
      },
      order: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Options');
  }
};
