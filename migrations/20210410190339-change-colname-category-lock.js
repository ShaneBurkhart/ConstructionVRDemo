'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('CategoryLocks', 'projectId', 'ProjectId');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('CategoryLocks', 'ProjectId', 'projectId');
  }
};
