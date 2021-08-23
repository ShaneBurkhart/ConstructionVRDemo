'use strict';
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();

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
    filename: DataTypes.STRING,
    pageCount: DataTypes.INTEGER,
    sheetsIndexesCompleted: DataTypes.JSONB,
    startedPipelineAt: DataTypes.DATE
  }, {});
  Document.associate = function(models) {
    // associations can be defined here
    // Document.hasMany(models.Sheet) //TODO: bring in sheet w/ pipeline
  };

  Document.beforeValidate(doc => {
    doc.uuid = uid()
  });

  return Document;
};
