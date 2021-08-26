const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { uuid } = require('uuidv4');


const Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY });
const base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

module.exports = (app) => {
  
  app.get("/api2/projects", m.authUser, async (req, res) => {
    try {
      const users = await models.User.findAll();
      const roles = models.User.rawAttributes.role.values;
      const projects = await models.Project.scope("withoutAdminToken").findAll({ where: { accessToken: { [Op.not]: null } } });
      
      res.json({ users, roles, projects });
    } catch (err) {
      return res.status(422).send("Could not load projects");
    }
  });

  app.post("/api2/create-new-project", m.authUser, async (req, res) => {
    if (!req.body.name) return res.status(422).send("A name is required");

    try {
      const newProject = await models.Project.create({ 
        name: req.body.name,
        accessToken: uuid(),
        adminAccessToken: uuid()
      });
  
      const { id, name, accessToken, adminAccessToken, last_seen_at, archived, v1 } = newProject;
      if (!id) return res.status(422).send("Could not add new project");
    

      // create Airtable record
      base('projects').create([
        {
          "fields": {
            "Name": name,
            "Admin Access Token": adminAccessToken,
            "Access Token": accessToken,
          }
        }
      ], function(error, _records) {
        if (error) {
          return res.status(error.statusCode).send("Could not add new project");
        }
        return res.status(200).send({ id, name, accessToken, last_seen_at, archived, v1 });
      });
    } catch (err) {
      return res.status(422).send("Could not complete request");
    }
  });

  app.post("/api2/update-project-seen-at", m.authUser, async (req, res) => {
    if (!req.body.id) return res.status(422).send("Cannot update date without project id");
    
    try {
      const project = await models.Project.findOne({ where: { id: req.body.id }});
      
      await project.update({
        last_seen_at: new Date(),
      });
      
      const { id, name, accessToken, last_seen_at, archived, v1 } = project;
      return res.status(200).send({ id, name, accessToken, last_seen_at, archived, v1 });
    } catch (err) {
      return res.status(422).send("could not update 'last seen' property");
    }
  });

  app.post("/api2/copy-project", m.authUser, async (req, res) => {
    if (!req.body.name) return res.status(422).send("A name is required");
    if (!req.body.id) return res.status(422).send("A project to copy is required");

    try {
      const projectToCopy = await models.Project.findOne({ where: { id: req.body.id }});
      if (!projectToCopy) return res.status(422).send("Could not copy project");
  
      const newProject = await models.Project.create({ 
        name: req.body.name,
        accessToken: uuid(),
        adminAccessToken: uuid()
      });
  
      const { id: newProjectId, name, adminAccessToken, accessToken, last_seen_at, archived, v1 } = newProject;
      if (!newProjectId) return res.status(422).send("Could not create new project");
  
      const finishesToCopy = await models.Finish.findAll({ where: { "ProjectId": req.body.id } });
  
      // TO DO - get locked attribute of categories
      const promisedNewFinishes = finishesToCopy
        .map(({ category, orderNumber, attributes }) => 
          models.Finish.create({ "ProjectId": newProjectId, category, orderNumber, attributes }));
  
      const newFinishes = await Promise.all(promisedNewFinishes);
      if (newFinishes.includes(null)) return res.status(422).send("Could not complete request");
  
  
      // create Airtable record
      base('projects').create([
        {
          "fields": {
            "Name": name,
            "Admin Access Token": adminAccessToken,
            "Access Token": accessToken,
          }
        }
      ], function(error, _records) {
        if (error) {
          return res.status(error.statusCode).send("Could not add new project");
        }
  
        return res.status(200).send({ id: newProjectId, name, accessToken, last_seen_at, archived, v1 });
      });
    } catch (error) {
      console.error({error})
      return res.status(422).send("Could not complete request to copy project");
    }
  });

  app.put("/api2/v2/update-project-name", m.authUser, async (req, res) => {
    const { projectId, newName } = req.body;
    if (!projectId) return res.status(422).send("Cannot update project without project id");
    if (isNaN(Number(projectId))) return res.status(422).send("Invalid project id");
    if (!newName) return res.status(422).send("Cannot update name without a new name");
    
    try {
      const project = await models.Project.findOne({ where: { id: Number(projectId) }});
      
      const getRecordId = new Promise((resolve, reject) => {
        base('projects').select({
          maxRecords: 1,
          filterByFormula: `{Access Token} = "${project.accessToken}"`
        }).eachPage(function page(records, _fetchNextPage){
          resolve(records[0].fields["Record ID"]);
        }, function done(err){
          if (err) console.error('*', err)
          if (err) reject("Could not find resource");
        })
      })
      
      const recordId = await getRecordId;

      base('projects').update([
        {
          "id": `${recordId}`,
          "fields": {
            "Name": `${newName}`
          }
        }
      ], async function(err, _records){
        if (err) return res.status(422).send("Could not process request");
        
        await project.update({ //update pg
          name: newName,
        });
  
        res.status(200).send({ newName });
      })
    } catch(error) {
      res.status(422).send("Could not complete request to rename project");
    }
  });

  app.post('/api2/toggle-archive-project', m.authUser, async (req, res) => {
    if (!req.body.id) return res.status(422).send("A project is required");

    try {
      const projectToArchive = await models.Project.findOne({ where: { id: req.body.id }});
      
      projectToArchive.update({
        archived: !projectToArchive.archived,
      });
      
      await projectToArchive.save();
      res.json(projectToArchive);
    } catch (error) {
      return res.status(422).send("Could not complete request to archive project")
    }
  });
}
