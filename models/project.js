'use strict';
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");

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

  Project.addHook("beforeCreate", (project, options) => {
    if (!project.accessToken) project.accessToken = uuidv4();
    if (!project.adminAccessToken) project.adminAccessToken = uuidv4();
  });

  Project.prototype.prettyUpdatedAt = () => {
    return moment(this.updatedAt).format("L");
  }

  return Project;
};
