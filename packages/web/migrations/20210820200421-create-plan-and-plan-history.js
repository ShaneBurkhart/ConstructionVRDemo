'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('Plans', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          ProjectId: {
            type: Sequelize.BIGINT,
          },
          name: {
            type: Sequelize.STRING,
          },
          filename: {
            type: Sequelize.STRING,
          },
          url: {
            type: Sequelize.STRING,
          },
          order: {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          archived: {
            defaultValue: false,
            type: Sequelize.BOOLEAN,
          },
          uploadedAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        }, { transaction: t }),
        queryInterface.createTable('PlanHistories', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          PlanId: {
            type: Sequelize.INTEGER,
          },
          name: {
            type: Sequelize.STRING,
          },
          filename: {
            type: Sequelize.STRING,
          },
          url: {
            type: Sequelize.STRING,
          },
          uploadedAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        }, { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('Plans', { transaction: t }),
        queryInterface.dropTable('PlanHistories', { transaction: t }),
      ]);
    });
  }
};