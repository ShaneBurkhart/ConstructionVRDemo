'use strict';
module.exports = (sequelize, DataTypes) => {
  const OptionImage = sequelize.define('OptionImage', {
    option_id: DataTypes.INTEGER,
    url: DataTypes.STRING
  }, {});
  OptionImage.associate = function(models) {
    // associations can be defined here
    OptionImage.belongsTo(models.Option);
  };
  return OptionImage;
};
