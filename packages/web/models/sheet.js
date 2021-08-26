'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sheet = sequelize.define('Sheet', {
    index: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    DocumentUuid: DataTypes.STRING,
    DocumentId: DataTypes.INTEGER,
    fullImgUrl: {
      type: DataTypes.VIRTUAL,
      get () { return `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/documents/${this.getDataValue("DocumentUuid")}_${this.getDataValue("index")}.png` }
    },
  }, {});
  Sheet.associate = function(models) {
    // associations can be defined here
    Sheet.belongsTo(models.Document)
  };
  return Sheet;
};
