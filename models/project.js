'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    TeamId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    adminAccessToken: DataTypes.STRING
  }, {});
  Project.associate = function(models) {
    // associations can be defined here
    Project.hasMany(models.Category);
    Project.hasMany(models.Selection);
    Project.hasMany(models.Option);
    Project.hasMany(models.OptionImage);
    Project.hasMany(models.SelectionLocation);
    Project.belongsTo(models.Team);
  };

  return Project;
};
