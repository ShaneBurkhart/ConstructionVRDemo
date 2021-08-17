'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Projects', 'archived', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }, { transaction: t }),
        queryInterface.addColumn('Projects', 'last_seen_at', {
          type: Sequelize.DATE,
        }, { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Projects', 'archived', { transaction: t }),
        queryInterface.removeColumn('Projects', 'last_seen_at', { transaction: t })
      ]);
    });
  }
};
