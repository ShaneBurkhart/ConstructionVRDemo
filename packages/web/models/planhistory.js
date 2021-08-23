'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlanHistory = sequelize.define('PlanHistory', {
    PlanId: DataTypes.INTEGER,
    filename: DataTypes.STRING,
    url: DataTypes.STRING,
    uploadedAt: DataTypes.DATE,
  }, {
    defaultScope: {
      order: [['uploadedAt', 'DESC']]
    }
  });
  PlanHistory.associate = function(models) {
    PlanHistory.belongsTo(models.Plan);
  };
  return PlanHistory;
};