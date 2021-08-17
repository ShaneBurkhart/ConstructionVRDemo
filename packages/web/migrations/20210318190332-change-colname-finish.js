'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Finishes', 'projectId', 'ProjectId');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Finishes', 'ProjectId', 'projectId');
  }
};
