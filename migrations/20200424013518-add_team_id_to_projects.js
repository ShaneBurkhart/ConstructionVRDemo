'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Projects', 'TeamId', {
          type: Sequelize.DataTypes.BIGINT,
          references: {
            model: "Teams",
            key: 'id',
          },
          onDelete: "SET NULL"
        }, { transaction: t }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Projects', 'TeamId', { transaction: t }),
      ]);
    });
  }
};
