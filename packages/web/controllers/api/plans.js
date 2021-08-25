// const { Sequelize, Op, QueryTypes } = require('sequelize');
// const AWS = require('aws-sdk')
const m = require("../middleware.js");
const models = require("../../models/index.js");
const queue = require("lambda-queue");

// AWS.config.update({
//   region: process.env["REGION"],
//   credentials: new AWS.Credentials(process.env["ACCESS_KEY_ID"], process.env["SECRET_ACCESS_KEY"])
// });
// const s3 = new AWS.S3({ params: { Bucket: process.env.BUCKET } });


module.exports = (app) => {  
  app.post("/api2/v2/plans/:project_access_token", m.authUser, async (req, res) => {
    let transaction;
    const accessToken = req.params["project_access_token"];
    const { filename, s3Url, name } = req.body;
    if (!s3Url || !filename) return res.status(422).send("Required file data was not received.");
    
    try { 
      const project = await models.Project.findOne({
        where: { accessToken },
        include: [{ model: models.Plan.scope("active"), required: false }],
      });
      
      if (!project) return res.status(404).send("Project not found");
      
      transaction = await models.sequelize.transaction();
      
      const order = (project.Plans || []).length;
      const plan = await project.createPlan({
        name: name || filename,
        order,
        uploadedAt: Date.now(),
      }, { transaction });


      if (!plan) throw new Error("could not create resource");
      
      const document = await plan.createDocument({
        s3Url,
        filename,
        startedPipelineAt: Date.now(),
      }, { transaction });
      
      if (!document) throw new Error("could not create document");
      
      queue.startSplitPdf({
        's3Key': encodeURIComponent(document.s3Url),
        'objectId': document.uuid
      });

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

  // pipelineWebhooks
  app.post("/api2/_webhooks/documents", async (req, res) => {
    const { type, data } = req.body

    console.log("FORM", req.body)

    switch (type) {
      case "SPLIT_PDF_COMPLETED":
        // Nothing to do 
        break
      case "PAGE_COUNT":
        await models.Document.update({ pageCount: data.pageCount }, { where: { uuid: data.objectId }})
        break
      case "SHEET_TO_IMAGE_COMPLETED":
        const doc = await models.Document.findOne({ where: { uuid: data.objectId }, include: models.Sheet })
        if (!doc) return res.status(422).send("")

        const sheets = doc.Sheets || []
        const pageIndex = data.pageIndex
        const sheet = sheets.find(s => s.index === pageIndex)
        if (sheet) return res.status(422).send("")

        await doc.createSheet({ index: pageIndex, width: data.sheetWidth, height: data.sheetHeight, DocumentUuid: doc.uuid })
        break

      default: 
        console.log("Invalid event type to webhook", type)
        res.status(422).send("Invalid type for webhook event")
    }

    res.send("Completed")
  });

}
