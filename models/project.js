'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    adminAccessToken: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    last_seen_at: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
  }, {});
  Project.associate = function(models) {
    // associations can be defined here
    Project.hasMany(models.Category);
    Project.hasMany(models.Selection);
    Project.hasMany(models.Option);
    Project.hasMany(models.OptionImage);
    Project.hasMany(models.SelectionLocation);
  };

  return Project;
};
