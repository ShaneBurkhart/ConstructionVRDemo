'use strict';
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();
const queue = require("lambda-queue");


module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    uuid: {
      allowNull: false, 
      type: DataTypes.STRING,
    },
    s3Url: {
      allowNull: false, 
      type: DataTypes.STRING,
    },
    filetype: DataTypes.STRING,
    filename: DataTypes.STRING,
    pageCount: DataTypes.INTEGER,
    startedPipelineAt: DataTypes.DATE
  }, {});
  Document.associate = function(models) {
    // associations can be defined here
    Document.hasMany(models.Sheet)
    Document.hasOne(models.Plan)
    Document.hasOne(models.PlanHistory)
  };

  Document.loadScopes = function(models) {
    Document.addScope('defaultScope', {
      include: [{
        model: models.Sheet
      }],
    })
  }

  Document.beforeValidate(doc => {
    doc.uuid = uid()
  });

  Document.afterCreate(doc => {
    if (doc.s3Url.endsWith('.pdf')) {
      queue.startSplitPdf({
        's3Key': encodeURIComponent(doc.s3Url),
        'objectId': doc.uuid
      });
    }
  });

  return Document;
};
