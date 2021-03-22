const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { uuid } = require('uuidv4');

module.exports = (app) => {
  
  app.get("/api2/v2/finishes/:project_access_token", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const adminMode = !!req.session["is_admin"]; // TO DO - use express auth not ruby
    
    try {
      const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
      if (!project) return res.status(404).send("Project not found");
      
      const finishes = await project.getFinishes();
  
      return res.json({ adminMode, finishes });
    } catch(error){
      console.log(error);
      res.status(422).send("Could not retrieve project information")
    }
  });
  
  app.post("/api2/v2/finishes/:project_access_token", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");

    const { category, attributes } = req.body;
    // const adminMode = !!req.session["is_admin"]; // should this be admin only?
    
    try {
      const finishList = await models.Finish.findAll({ where: { ProjectId: project.id, category: category }});
      const newFinish = await models.Finish.create({
        ProjectId: project.id,
        category,
        orderNumber: finishList.length,
        attributes,
      });
      return res.json(newFinish);
    } catch(error){
      console.log(error)
      return res.status(422).send("Could not create new Finish")
    }
  });
  
  app.put("/api2/v2/finishes/:project_access_token/:finish_id", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const finishId = req.params["finish_id"];
    console.log({finishId});
    if (!finishId) return res.status(400).send("Finish ID required");
    
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");

    const finish = await models.Finish.findOne({ where: { id: finishId, ProjectId: project.id }});
    if (!finish) return res.status(404).send("Finish not found");

    const { category, attributes } = req.body;
    console.log({category, attributes});
    try {
      const updatedFinish = await finish.update({
        category,
        attributes,
      });
      return res.json(updatedFinish);
    } catch(error){
      console.log(error)
      return res.status(422).send("Could not update Finish")
    }
  });
  
  app.patch("/api2/v2/finishes/:project_access_token/:finish_id/order", async (req, res) => {
    const projectAccessToken = req.params["project_access_token"];
    const finishId = req.params["finish_id"];
    if (!finishId) return res.status(400).send("Finish ID required");
    
    const project = await models.Project.findOne({ where: { accessToken: projectAccessToken } });
    if (!project) return res.status(404).send("Project not found");

    const finish = await models.Finish.findOne({ where: { id: finishId, ProjectId: project.id }});
    if (!finish) return res.status(404).send("Finish not found");

    const { orderNumber } = req.body;
    if (!orderNumber || isNaN(Number(orderNumber))) return res.status(400).send("A valid order number is required");

    const getOrderNumber = (num, list) => {
      if (num < 0) return 0;
      if (num > list.length) return list.length;
      return num;
    }

    try {
      const finishList = await models.Finish.findAll({ where: { ProjectId: project.id, category: category }});
      const newOrderNumber = getOrderNumber(orderNumber, finishList);
      const filteredFinishList = finishList.filter(f => f.id !== finish.id).sort((a,b) => a.orderNumber - b.orderNumber);
      const newFinishList = filteredFinishList.splice(newOrderNumber, 0, finish);

      const promisedNewOrderedList = newFinishList.map((f, i) => f.update({ orderNumber: i }))
      const newOrderedList = await Promise.all(promisedNewOrderedList);
      if (newOrderedList.includes(null)) return res.status(422).send("Could not complete request");

      return res.json(newOrderedList);
    } catch(error){
      console.log(error)
      return res.status(422).send("Could not complete update")
    }
  });

}
