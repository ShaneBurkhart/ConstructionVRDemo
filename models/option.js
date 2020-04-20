'use strict';
module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('Option', {
    ProjectId: DataTypes.BIGINT,
    SelectionId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    unitPrice: DataTypes.STRING,
    type: DataTypes.STRING,
    url: DataTypes.STRING,
    manufacturer: DataTypes.STRING,
    itemNum: DataTypes.STRING,
    style: DataTypes.STRING,
    info: DataTypes.TEXT,
    order: DataTypes.INTEGER
  }, {});
  Option.associate = function(models) {
    // associations can be defined here
    Option.hasMany(models.OptionImage);
    Option.belongsTo(models.Selection);
    Option.belongsTo(models.Project);
  };
  return Option;
};
