const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { uuid } = require('uuidv4');

async function _findProjectByAccessToken(projectAccessToken) {
  const projectResults = await models.Project.findAll({
    where: { accessToken: projectAccessToken },
  });
  return projectResults[0];
}

module.exports = (app) => {
  
  app.get("/api2/v2/finishes/:project_access_token", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const adminMode = !!req.session["is_admin"]; // TO DO - use express auth not ruby
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");
    
    let finishes = []
    
    try {
      finishes = await project.getFinishes();
    } catch(error) {
      console.log(error);
    }
    res.json({adminMode, finishes});
  });
  
  app.post("/api2/v2/finishes/:project_access_token", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    const { category, attributes } = req.body;
    const adminMode = !!req.session["is_admin"];
    // should this be admin only?
    console.log(JSON.stringify(project))
    let finishList = [];
    try {
      finishList = await models.Finish.findAll({ where: { projectId: project.id, category: category }});
    } catch(error) {
      console.log(error)
    }
    const newFinish = await models.Finish.create({
      ProjectId: project.id,
      category,
      orderNumber: finishList.length,
      attributes,
    });
    console.log({ newFinish });
    res.json(newFinish);
  });
}
