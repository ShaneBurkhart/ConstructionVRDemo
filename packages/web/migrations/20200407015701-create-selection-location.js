'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SelectionLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      location: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('SelectionLocations');
  }
};
