const m = require("../middleware.js");
const models = require("../../models/index.js");
const queue = require("lambda-queue");

module.exports = (app) => {  
  app.post("/api2/v2/plans/:project_access_token", m.authUser, async (req, res) => {
    let transaction;
    const accessToken = req.params["project_access_token"];
    const { filename, s3Url, name } = req.body; //TODO: filetype
    if (!s3Url || !filename) return res.status(422).send("Required file data was not received.");
    
    try { 
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan.scope("active"), required: false }],
      });
      
      if (!project) return res.status(404).send("Project not found");
      
      transaction = await models.sequelize.transaction();

      const document = await models.Document.create({
        s3Url,
        filename,
      }, { transaction });

      if (!document) throw new Error("could not create document");
      
      const order = (project.Plans || []).length;
      const plan = await project.createPlan({
        DocumentId: document.id,
        name: name || filename,
        order,
        uploadedAt: Date.now(),
      }, { transaction });

      if (!plan) throw new Error("could not create resource");

      await transaction.commit();

      await plan.reload({ include: [{ model: models.Document }, { model: models.PlanHistory, required: false }]});

      if (!plan) throw new Error("could not complete creation of document");
      
      res.json({ newPlan: plan });
    } catch(error){
      if (transaction) await transaction.rollback();
      console.error(error);
      return res.status(422).send("Could not create new file");
    }
  });
  
  app.put("/api2/v2/plans/:project_access_token/:plan_id", m.authUser, async (req, res) => {
    const accessToken = req.params["project_access_token"];
    const planId = req.params["plan_id"];
    const { filename, s3Url, name } = req.body;
    
    try {
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan.scope('withPlanHistoryAndDocs') }]
      });
      if (!project) return res.status(404).send("Project resource not found");

      const plan = (project.Plans || []).find(p => p.id == planId);
      if (!plan) return res.status(404).send("Could not find file resource");
      
      if (!!name) {
        await plan.update({ name });
      }

      if (!!s3Url) {
        const didUpdate = await plan.updateHistory(s3Url, filename);
        if (!didUpdate) throw new Error("update method failed");
      }

      await project.reload({
        include: [{ model: models.Plan.scope('withPlanHistoryAndDocs') }]
      });

      const refreshedPlans = project.Plans || [];

      return res.json(refreshedPlans);
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not update plan");
    }
  });
  
  app.put("/api2/v2/plans/:project_access_token/:plan_id/archive", m.authUser, async (req, res) => {
    const accessToken = req.params["project_access_token"];
    const planId = req.params["plan_id"];
    
    let transaction;
    
    try {
      transaction = await models.sequelize.transaction();
      
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan }],
      });

      if (!project) return res.status(404).send("Project not found");

      const plan = (project.Plans || []).find(p => p.id == planId);
      if (!plan) return res.status(404).send("Could not find file resource");
      
      const activePlans = (project.Plans || []).filter(p => !p.archived);
      if (plan.archived) {
        const order = activePlans.length;
        await plan.update({ archived: false, order }, { transaction });
      } else {
        
        await plan.update({ archived: true }, { transaction });
        
        //re-order plans
        const nextPlans = activePlans.filter(p => p.id !== plan.id);
        for (let i = 0; i < nextPlans.length; i++) {
          await nextPlans[i].update({ order: i }, { transaction })
        }
      }
      
      await transaction.commit();
      
      await project.reload({
        include: [{ model: models.Plan.scope('withPlanHistoryAndDocs') }]
      });
      
      const refreshedPlans = project.Plans || [];


      return res.json(refreshedPlans);
    } catch(error){
      if (transaction) await transaction.rollback();
      console.error(error);
      return res.status(422).send("Could not update plan");
    }
  });

  app.put("/api2/v2/plans/:project_access_token/:plan_id/order", m.authUser, async (req, res) => {
    const accessToken = req.params["project_access_token"];
    const planId = req.params["plan_id"];
    const { newOrderNum=null } = req.body;
    
    if (newOrderNum === null) return res.status(422).send("Required information not provided");
    if (isNaN(Number(newOrderNum))) return res.status(400).send("A valid order number was not received");
  
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan.scope("active") }],
        order: [
          [ { model: models.Plan }, 'order', 'ASC' ],
        ],
      });
      
      if (!project) return res.status(404).send("Project not found");

      const plans = project.Plans || [];
      const plan = plans.find(p => p.id == planId);
      if (!plan) return res.status(404).send("Could not find file resource");
  
      let controlledNewOrderNum = newOrderNum;
      if (newOrderNum < 0) controlledNewOrderNum = 0;
      if (newOrderNum > plans.length) controlledNewOrderNum = plans.length;
      
      const nextPlans = plans.filter(p => p.id !== plan.id);
  
      nextPlans.splice(controlledNewOrderNum, 0, plan);
  
      for (let i = 0; i < plans.length; i++){
        await nextPlans[i].update({ order: i }, { transaction });
      }
  
      await transaction.commit();
      
      await project.reload({
        include: [{ model: models.Plan.scope('withPlanHistoryAndDocs') }]
      });

      const refreshedPlans = project.Plans || [];

      return res.json(refreshedPlans);
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log(error);
      res.status(422).send("Could not successfully update plan orders");
    }
  });
}
