'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlanHistory = sequelize.define('PlanHistory', {
    PlanId: DataTypes.INTEGER,
    DocumentId: DataType.INTEGER,
    uploadedAt: DataTypes.DATE,
  }, {
    defaultScope: {
      order: [['uploadedAt', 'DESC']]
    }
  });
  PlanHistory.associate = function(models) {
    PlanHistory.belongsTo(models.Plan);
    PlanHistory.hasOne(models.Document);
  };
  return PlanHistory;
};