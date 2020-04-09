'use strict';
module.exports = (sequelize, DataTypes) => {
  const SelectionLocation = sequelize.define('SelectionLocation', {
    ProjectId: DataTypes.BIGINT,
    SelectionId: DataTypes.BIGINT,
    location: DataTypes.STRING
  }, {});
  SelectionLocation.associate = function(models) {
    // associations can be defined here
    SelectionLocation.belongsTo(models.Selection);
    SelectionLocation.belongsTo(models.Project);
  };
  return SelectionLocation;
};
