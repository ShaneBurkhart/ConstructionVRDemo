'use strict';
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    PlanId: DataTypes.INTEGER,
    PlanHistoryId: DataTypes.INTEGER,
    uuid: {
      allowNull: false, 
      type: DataTypes.STRING,
    },
    s3Url: {
      allowNull: false, 
      type: DataTypes.STRING,
    },
    filename: DataTypes.STRING,
    pageCount: DataTypes.INTEGER,
    startedPipelineAt: DataTypes.DATE
  }, {});
  Document.associate = function(models) {
    // associations can be defined here
    Document.hasMany(models.Sheet)
    Document.belongsTo(models.Plan)
    Document.belongsTo(models.PlanHistory)
  };

  Document.beforeValidate(doc => {
    doc.uuid = uid()
  });

  return Document;
};
