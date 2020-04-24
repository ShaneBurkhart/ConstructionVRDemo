'use strict';
module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: DataTypes.STRING,
    workspaceSubdomain: DataTypes.STRING
  }, {});
  Team.associate = function(models) {
    // associations can be defined here
    Team.belongsToMany(models.User, { through: models.TeamMembership });
    Team.hasMany(models.Project);
    Team.hasMany(models.Option);
  };
  return Team;
};
