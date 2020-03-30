'use strict';
module.exports = (sequelize, DataTypes) => {
  const Selection = sequelize.define('Selection', {
    category_id: DataTypes.INTEGER,
    room: DataTypes.STRING,
    type: DataTypes.STRING,
    location: DataTypes.STRING,
    notes: DataTypes.TEXT,
    order: DataTypes.INTEGER
  }, {});
  Selection.associate = function(models) {
    // associations can be defined here
    Selection.hasMany(models.Option);
    Selection.belongsTo(models.Category);
  };
  return Selection;
};
