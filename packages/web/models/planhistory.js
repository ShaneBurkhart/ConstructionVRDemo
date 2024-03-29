'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlanHistory = sequelize.define('PlanHistory', {
    PlanId: DataTypes.INTEGER,
    DocumentId: DataTypes.INTEGER,
    uploadedAt: DataTypes.DATE,
  }, {});

  PlanHistory.associate = function(models) {
    PlanHistory.belongsTo(models.Plan);
    PlanHistory.belongsTo(models.Document);
  };

  return PlanHistory;
};
