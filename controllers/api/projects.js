const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { uuid } = require('uuidv4');


const Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY });
const base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

module.exports = (app) => {
  
  app.get("/api2/projects", m.authSuperAdmin, async (req, res) => {
    const users = await models.User.findAll();
    const roles = models.User.rawAttributes.role.values;

    const projectsAllInfo = await models.Project.findAll({ where: { accessToken: { [Op.not]: null } } });
    // here we are obscuring token names from adminAccessToken to href
    const projects = projectsAllInfo.map(({ id, name, adminAccessToken, accessToken, archived, last_seen_at, v1 }) => 
      ({ id, name, href: adminAccessToken, accessToken, archived, last_seen_at, v1 }));
    res.json({ users, roles, projects });
  });

  app.post("/api2/create-new-project", m.authSuperAdmin, async (req, res) => {
    if (!req.body.name) return res.status(422).send("A name is required")

    const newProject = await models.Project.create({ 
      name: req.body.name,
      accessToken: uuid(),
      adminAccessToken: uuid()
    });

    const { id, name, accessToken, adminAccessToken, last_seen_at, archived, v1 } = newProject;
    if (!id) return res.status(422).send("Could not add new project");
    
    // add a few basic categories for 'new project' template
    const categories = ["Concepts", "Flooring", "Light Fixtures", "Misc"];

    const promises = categories.map((c, i) => models.Category.create({ name: c, order: i, "ProjectId": id }));
    const newCategories = await Promise.all(promises);
    if (newCategories.includes(null)) return res.status(422).send("Could not complete request");

    // create Airtable record
    base('projects').create([
      {
        "fields": {
          "Name": name,
          "Admin Access Token": adminAccessToken,
          "Access Token": accessToken,
        }
      }
    ], function(error, records) {
      if (error) {
        console.error(error);
        return res.status(error.statusCode).send("Could not add new project");
      }
      return res.status(200).send({ id, name, accessToken, href: adminAccessToken, last_seen_at, archived, v1 });
    });
  });

  app.post("/api2/update-project-seen-at", m.authUser, async (req, res) => {
    if (!req.body.id) return res.status(422).send("Cannot update date without project id");
    
    const project = await models.Project.findOne({ where: { id: req.body.id }});
    await project.update({
      last_seen_at: new Date(),
    });
    const { id, name, accessToken, adminAccessToken, last_seen_at, archived, v1 } = project;
    return res.status(200).send({ id, name, accessToken, href: adminAccessToken, last_seen_at, archived, v1 })
  });

  app.post("/api2/copy-project", m.authSuperAdmin, async (req, res) => {
    if (!req.body.name) return res.status(422).send("A name is required");
    if (!req.body.id) return res.status(422).send("A project to copy is required");
  
    const projectToCopy = await models.Project.findOne({ where: { id: req.body.id }});
    if (!projectToCopy) return res.status(422).send("Could not copy project");

    const newProject = await models.Project.create({ 
      name: req.body.name,
      accessToken: uuid(),
      adminAccessToken: uuid()
    });

    const { id: newProjectId, name, accessToken, adminAccessToken, last_seen_at, archived, v1 } = newProject;
    if (!newProjectId) return res.status(422).send("Could not create new project");

    const finishesToCopy = await models.Finish.findAll({ where: { "ProjectId": req.body.id } });

    const promisedNewFinishes = finishesToCopy
      .map(({ category, orderNumber, attributes }) => 
        models.Finish.create({ "ProjectId": newProjectId, category, orderNumber, attributes}));

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
    ], function(error, records) {
      if (error) {
        console.error(error);
        return res.status(error.statusCode).send("Could not add new project");
      }

      return res.status(200).send({ id: newProjectId, name, accessToken, href: adminAccessToken, last_seen_at, archived, v1 });
    });
  });

  app.put("/api2/v2/update-project-name", m.authSuperAdmin, async (req, res) => {
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
      ], async function(err, records){
        if (err) console.error(err);
        if (err) return res.status(422).send("Could not process request");
        
        await project.update({ //update pg
          name: newName,
        });
  
        res.status(200).send({ newName });
      })
    } catch(error) {
      res.status(422).send("Could not complete request");
    }
  });

  app.post('/api2/toggle-archive-project', m.authSuperAdmin, async (req, res) => {
    if (!req.body.id) return res.status(422).send("A project is required")

    const projectToArchive = await models.Project.findOne({ where: { id: req.body.id }});
    projectToArchive.update({
      archived: !projectToArchive.archived,
    });
    await projectToArchive.save();
    res.json(projectToArchive);
  });
}
