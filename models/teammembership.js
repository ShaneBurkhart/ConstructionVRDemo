'use strict';
module.exports = (sequelize, DataTypes) => {
  const TeamMembership = sequelize.define('TeamMembership', {
    role: DataTypes.STRING
  }, {});
  TeamMembership.associate = function(models) {
    // associations can be defined here
  };
  return TeamMembership;
};
