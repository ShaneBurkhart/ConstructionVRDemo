'use strict';
const { Op } = require('sequelize');
const queue = require("lambda-queue");

module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    ProjectId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    order: DataTypes.INTEGER,
    uploadedAt: DataTypes.DATE,
    archived: DataTypes.BOOLEAN,
  }, {
    scopes: {
      active: {
        where: { archived: { [Op.is]: false }},
      }, 
    }
  });
  
  Plan.associate = function(models) {
    Plan.belongsTo(models.Project);
    Plan.hasOne(models.Document);
    Plan.hasMany(models.PlanHistory);
  };

  Plan.prototype.updateHistory = async function updateHistory(s3Url, filename) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const planHistory = await this.createPlanHistory({
        uploadedAt: this.uploadedAt,
      }, { transaction });
      
      const document = await this.getDocument();
      if (!document) throw new Error("previous document not found");
      
      await document.update({
        PlanId: null,
        PlanHistoryId: planHistory.id,
      }, { transaction });
      
      const newDocument = await this.createDocument({
        s3Url,
        filename,
        startedPipelineAt: Date.now(),
      }, { transaction });
      
      if (!newDocument) throw new Error("new document was not created");

      await this.update({
        uploadedAt: Date.now(),
      }, { transaction });

      await transaction.commit();

      queue.startSplitPdf({
        's3Key': encodeURIComponent(document.s3Url),
        'objectId': document.uuid
      });
      
      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log(error);
      return false;
    }
  };

  return Plan;
};