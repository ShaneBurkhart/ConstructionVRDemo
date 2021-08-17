'use strict';
module.exports = (sequelize, DataTypes) => {
  const OptionImage = sequelize.define('OptionImage', {
    ProjectId: DataTypes.BIGINT,
    OptionId: DataTypes.BIGINT,
    url: DataTypes.STRING
  }, {});
  OptionImage.associate = function(models) {
    // associations can be defined here
    OptionImage.belongsTo(models.Option);
    OptionImage.belongsTo(models.Project);
  };
  return OptionImage;
};
