'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Selections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Categories",
          key: 'id'
        },
      },
      room: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      notes: {
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
    return queryInterface.dropTable('Selections');
  }
};
