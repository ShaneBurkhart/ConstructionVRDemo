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
        include: [{ model: models.Plan.scope("active") }],
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
        include: [{ model: models.Plan, include: [{ model: models.PlanHistory }] }],
      });
      if (!project) return res.status(404).send("Project not found");

      const plan = (project.Plans || []).find(p => p.id === planId);
      if (!plan) return res.status(404).send("Could not find file resource");
      
      if (!!name) {
        await plan.update({ name });
      }

      if (!!url) {
        const didUpdate = await plan.updateHistory(url, filename);
        if (!didUpdate) throw new Error("update method failed");
      }

      const refreshedPlans = await project.getPlans();

      return res.json(refreshedPlans);
    } catch(error){
      console.error(error);
      return res.status(422).send("Could not update plan");
    }
  });
}
