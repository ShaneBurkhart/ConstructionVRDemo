'use strict';
module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('Option', {
    selection_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    url: DataTypes.STRING,
    info: DataTypes.TEXT,
    order: DataTypes.INTEGER
  }, {});
  Option.associate = function(models) {
    // associations can be defined here
    Option.hasMany(models.OptionImage);
    Option.belongsTo(models.Selection);
  };
  return Option;
};
