'use strict';
module.exports = (sequelize, DataTypes) => {
  const CategoryLock = sequelize.define('CategoryLock', {
    category: DataTypes.STRING,
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ProjectId: DataTypes.BIGINT
  }, {});
  CategoryLock.associate = function(models) {
    // associations can be defined here
    CategoryLock.belongsTo(models.Project);
  };
  return CategoryLock;
};
