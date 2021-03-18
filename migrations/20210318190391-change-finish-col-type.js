'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Finishes', 'ProjectId', { type: Sequelize.BIGINT });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Finishes', 'ProjectId', { type: Sequelize.INTEGER });

  }
};