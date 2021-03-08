const { Sequelize, Op } = require('sequelize');
const m = require("../middleware.js");
const models = require("../../models/index.js");
const { uuid } = require('uuidv4');


const Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY });
const base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

module.exports = (app) => {
  app.post("/api2/create-new-project", m.authSuperAdmin, async (req, res) => {
    if (!req.body.name) return res.status(422).send("A name is required")

    const newProject = await models.Project.create({ 
      name: req.body.name,
      accessToken: uuid(),
      adminAccessToken: uuid()
    });

    const { id, name, accessToken, adminAccessToken } = newProject;
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
      return res.status(200).send({ id, name, accessToken, adminAccessToken });
    });
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

    const { id: newProjectId, name, accessToken, adminAccessToken } = newProject;
    if (!newProjectId) return res.status(422).send("Could not create new project");

    const categoriesToCopy = await models.Category.findAll({ where: { "ProjectId": req.body.id } });
    const selectionsToCopy = await models.Selection.findAll({ where: { "ProjectId": req.body.id }});
    const optionsToCopy = await models.Option.findAll({ where: { "ProjectId": req.body.id }});
    const imagesToCopy = await models.OptionImage.findAll({ where: { "ProjectId": req.body.id }});
    
    const promisedNewCategories = categoriesToCopy.map(({ name, order }) => models.Category.create({ name, order, "ProjectId": newProjectId }));
    const newCategories = await Promise.all(promisedNewCategories);
    if (newCategories.includes(null)) return res.status(422).send("Could not complete request");

    
    const copyImage = (image, newOptionId) => {
      const { url } = image;
      const newImage = models.OptionImage.create({
        "ProjectId": newProjectId,
        "OptionId": newOptionId,
        url
      });
    }
    
    const copyOption = async (option, newSelectionId) => {
      const {name, unitPrice, type, url, manufacturer, itemNum, style, size, info, order} = option;
      const imagesPerOption = imagesToCopy.filter(i => i["OptionId"] === option.id);

      const newOption = await models.Option.create({
        "ProjectId": newProjectId,
        "SelectionId": newSelectionId,
        name,
        unitPrice,
        type,
        url,
        manufacturer,
        itemNum,
        style,
        size,
        info,
        order
      });

      imagesPerOption.forEach(i => copyImage(i, newOption.id))
    }

    const copySelection = async (selection, newCategoryId) => {
      const { room, type, location, notes, order } = selection;
      const optionsPerSelection = optionsToCopy.filter(o => o["SelectionId"] === selection.id)
      const newSelection = await models.Selection.create({
        "ProjectId": newProjectId,
        "CategoryId": newCategoryId,
        room,
        type,
        location,
        notes,
        order
      });

      optionsPerSelection.forEach(option => copyOption(option, newSelection.id));
    }

    newCategories.forEach((c, i) => {
      const selectionsPerCategory = selectionsToCopy.filter(s => s["CategoryId"] === categoriesToCopy[i].id);
      selectionsPerCategory.forEach(selection => copySelection(selection, c.id))
    });


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

      return res.status(200).send({ newProjectId, name, accessToken, adminAccessToken });
    });

  })
}
