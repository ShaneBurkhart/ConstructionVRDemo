'use strict';
const { Op } = require('sequelize');
const { finishCategoriesMap, attrMap } = require('../common/constants');
const activeCategories = Object.keys(finishCategoriesMap);

module.exports = (sequelize, DataTypes) => {
  const Finish = sequelize.define('Finish', {
    ProjectId: DataTypes.BIGINT,
    category: DataTypes.STRING,
    orderNumber: DataTypes.INTEGER,
    attributes: DataTypes.JSONB,
    displayName: {
      type: DataTypes.VIRTUAL,
      get () {
        const attrList = (finishCategoriesMap[this.getDataValue("category")] || {}).attr || [];
        const attributes = this.getDataValue("attributes") || {};
        return attrList
          .filter(a => attributes[a] && !attrMap[a].excludeFromName)
          .map(a => attributes[a])
          .join(", ");
      }
    }
  }, {
    defaultScope: {
      where: { category: { [Op.in]: activeCategories }}
    }
  });
  Finish.associate = function(models) {
    Finish.belongsTo(models.Project);
  };
  return Finish;
};