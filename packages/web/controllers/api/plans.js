// const { Sequelize, Op, QueryTypes } = require('sequelize');
// const AWS = require('aws-sdk')
const m = require("../middleware.js");
const models = require("../../models/index.js");

// AWS.config.update({
//   region: process.env["REGION"],
//   credentials: new AWS.Credentials(process.env["ACCESS_KEY_ID"], process.env["SECRET_ACCESS_KEY"])
// });
// const s3 = new AWS.S3({ params: { Bucket: process.env.BUCKET } });


module.exports = (app) => {  
  app.post("/api2/v2/plans/:project_access_token", m.authUser, async (req, res) => {
    const accessToken = req.params["project_access_token"];
    const { filename, url, name } = req.body;
    if (!url || !filename) return res.status(422).send("a url and filename are required");
    
    try {
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan.scope("active"), required: false }],
      });

      if (!project) return res.status(404).send("Project not found");
      
      const order = (project.Plans || []).length;

      const newPlan = await project.createPlan({
        name: name || filename,
        url,
        filename,
        order,
        uploadedAt: Date.now(),
      });

      res.json({ newPlan });
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not create new file");
    }
  });
  
  app.put("/api2/v2/plans/:project_access_token/:plan_id", m.authUser, async (req, res) => {
    const accessToken = req.params["project_access_token"];
    const planId = req.params["plan_id"];
    const { filename, url, name } = req.body;
    
    try {
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan }],
        order: [
          [ { model: models.Plan}, 'order', 'ASC' ],
        ]
      });
      if (!project) return res.status(404).send("Project resource not found");

      const plan = (project.Plans || []).find(p => p.id == planId);
      if (!plan) return res.status(404).send("Could not find file resource");
      
      if (!!name) {
        await plan.update({ name });
      }

      if (!!url) {
        const didUpdate = await plan.updateHistory(url, filename);
        if (!didUpdate) throw new Error("update method failed");
      }

      const refreshedPlans = await project.getPlans({ include: [{ model: models.PlanHistory }]});

      return res.json(refreshedPlans);
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not update plan");
    }
  });
  
  app.put("/api2/v2/plans/:project_access_token/:plan_id/archive", m.authUser, async (req, res) => {
    let transaction;
    const accessToken = req.params["project_access_token"];
    const planId = req.params["plan_id"];
    
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
      
      const refreshedPlans = await project.getPlans({ include: [{ model: models.PlanHistory }]});
      
      await transaction.commit();
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

      const refreshedPlans = await project.getPlans({ include: [{ model: models.PlanHistory }]});

      return res.json(refreshedPlans);
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log(error);
      res.status(422).send("Could not successfully update plan orders");
    }
  });
}
