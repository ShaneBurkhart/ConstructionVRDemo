'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Project', 'TeamId', {
        type: Sequelize.DataTypes.BIGINT
      }, { transaction: t }),
      queryInterface.addColumn('Option', 'TeamId', {
        type: Sequelize.DataTypes.BIGINT
      }, { transaction: t }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Project', 'TeamId', { transaction: t }),
        queryInterface.removeColumn('Option', 'TeamId', { transaction: t }),
      ]);
    });
  }
};
