'use strict';
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    ProjectId: DataTypes.BIGINT,
    DocumentId: DataTypes.INTEGER,
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

  Plan.loadScopes = function(models) {
    Plan.addScope('withPlanHistoryAndDocs', {
      include: [
        {
          model: models.PlanHistory,
          include: [ { model: models.Document } ],
        },
        { model: models.Document },
      ],
      order: [ [{ model: models.PlanHistory }, 'uploadedAt', 'DESC'] ]
    });
  }
  
  Plan.associate = function(models) {
    Plan.belongsTo(models.Project);
    Plan.belongsTo(models.Document);
    Plan.hasMany(models.PlanHistory);
  };

  Plan.prototype.updateHistory = async function updateHistory(s3Url, filename) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      //TODO: update w/ didFail plans defaults
      const planHistory = await this.createPlanHistory({
        uploadedAt: this.uploadedAt,
        DocumentId: this.DocumentId,
      }, { transaction });
      
      const newDocument = await sequelize.models.Document.create({
        s3Url,
        filename,
        //TODO: filetype
        startedPipelineAt: Date.now(),
      }, { transaction });
      
      if (!newDocument) throw new Error("new document was not created");

      await this.update({
        DocumentId: newDocument.id,
        uploadedAt: Date.now(),
      }, { transaction });

      await transaction.commit();
      await newDocument.save();
      
      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log(error);
      return false;
    }
  };

  return Plan;
};