'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Finishes', 'attributes', { type: Sequelize.JSONB });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Finishes', 'attributes', { type: Sequelize.JSON });

  }
};