'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    order: DataTypes.INTEGER,
    ProjectId: DataTypes.BIGINT
  }, {});
  Category.associate = function(models) {
    // associations can be defined here
    Category.hasMany(models.Selection);
    Category.belongsTo(models.Project);
  };

  const bumpProjectUpdatedAt = (category, options) => {
    return sequelize.models.Project.update({ updatedAt: new Date() }, {
      where: { ProjectId: category.ProjectId }
    });
  }

  Category.addHook("afterUpdate", bumpProjectUpdatedAt)

  return Category;
};
