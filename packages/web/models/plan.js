'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    ProjectId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    filename: DataTypes.STRING,
    url: DataTypes.STRING,
    order: DataTypes.INTEGER,
    uploadedAt: DataTypes.DATE,
    archived: DataTypes.BOOLEAN,
  }, {
    scopes: {
      active: {
        where: { archived: false },
      }, 
    }
  });
  
  Plan.associate = function(models) {
    Plan.belongsTo(models.Project);
    Plan.hasMany(models.PlanHistory);
  };

  Plan.prototype.updateHistory = async function updateHistory(newUrl, newFilename) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      
      await this.createPlanHistory({
        filename: this.filename,
        url: this.url,
        uploadedAt: this.uploadedAt,
      }, { transaction });

      await this.update({
        url: newUrl,
        filename: newFilename,
        uploadedAt: Date.now(),
      }, { transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log(error);
      return false;
    }
  };

  return Plan;
};