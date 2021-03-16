'use strict';
module.exports = (sequelize, DataTypes) => {
  const Finish = sequelize.define('Finish', {
    projectId: DataTypes.INTEGER,
    category: DataTypes.STRING,
    orderNumber: DataTypes.INTEGER,
    attributes: DataTypes.JSON
  }, {});
  Finish.associate = function(models) {
    // associations can be defined here
  };
  return Finish;
};