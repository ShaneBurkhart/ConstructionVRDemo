'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    adminAccessToken: DataTypes.STRING,
    documentUrl: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    v1: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_seen_at: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
  }, {
    scopes: {
      withoutAdminToken: {
        attributes: {
          exclude: [ 'adminAccessToken' ],
        },
      },
    }
  });
  Project.associate = function(models) {
    // associations can be defined here
    Project.hasMany(models.Category);
    Project.hasMany(models.Plan);
    Project.hasMany(models.CategoryLock);
    Project.hasMany(models.Selection);
    Project.hasMany(models.Option);
    Project.hasMany(models.OptionImage);
    Project.hasMany(models.SelectionLocation);
    Project.hasMany(models.Finish);
  };

  return Project;
};
