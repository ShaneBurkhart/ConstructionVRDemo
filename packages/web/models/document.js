'use strict';
const AWS = require('aws-sdk');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();
const queue = require("lambda-queue");

AWS.config.update({
  region: process.env["AWS_REGION"],
  credentials: new AWS.Credentials(process.env["AWS_ACCESS_KEY_ID"], process.env["AWS_SECRET_ACCESS_KEY"])
});
const s3 = new AWS.S3({ params: { Bucket: process.env.AWS_BUCKET } });


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
    Document.addScope('withSheets', {
      include: [{
        model: models.Sheet
      }],
    })
  }

  Document.beforeValidate(doc => {
    doc.uuid = uid()
  });

  Document.afterCreate((doc) => {
    if (doc.s3Url.endsWith('.pdf')) {
      doc.update({ startedPipelineAt: Date.now() })
      queue.startSplitPdf({
        's3Key': encodeURIComponent(doc.s3Url),
        'objectId': doc.uuid
      });
    }
  });

  return Document;
};
