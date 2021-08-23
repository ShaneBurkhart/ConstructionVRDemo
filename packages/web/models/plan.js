'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    ProjectId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    filename: DataTypes.STRING,
    url: DataTypes.STRING,
    order: DataTypes.INTEGER,
    uploadedAt: DataTypes.DATE,
    archived: DataTypes.BOOLEAN,
  }, {});
  Plan.associate = function(models) {
    Plan.belongsTo(models.Project);
  };
  return Plan;
};