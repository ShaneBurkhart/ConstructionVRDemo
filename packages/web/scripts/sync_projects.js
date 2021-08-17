const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var models = require("../models/index.js");

var Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY })
var base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function addCategory(category, projectId) {
  let c;
  try {
    c = await models.Category.create({
      name: category["fields"]["Name"],
      order: category["fields"]["Order"],
      ProjectId: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addSelection(selection, categoryId, projectId) {
  let c;
  try {
    c = await models.Selection.create({
      room: selection["fields"]["Room"],
      type: selection["fields"]["Type"],
      location: selection["fields"]["Location"],
      notes: selection["fields"]["Notes"],
      order: selection["fields"]["Order"],
      CategoryId: categoryId,
      ProjectId: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addOption(option, selectionId, projectId) {
  let c;
  try {
    c = await models.Option.create({
      name: option["fields"]["Name"],
      type: option["fields"]["Type"],
      url: option["fields"]["URL"],
      info: option["fields"]["Info"],
      order: option["fields"]["Order"],
      unitPrice: option["fields"]["Unit Price"],
      SelectionId: selectionId,
      ProjectId: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addOptionImage(optionImage, optionId, projectId) {
  let c;
  try {
    c = await models.OptionImage.create({
      url: optionImage["url"],
      OptionId: optionId,
      ProjectId: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

(async () => {
  console.log("Migrating...");

  var projects = await base("Projects").select({ }).all();
  await wait(1000);

  for (var k in projects) {
    const project = projects[k];
    const existing = await models.Project.findOne({
      where: { accessToken: project["fields"]["Access Token"] }
    });
    if (existing) continue;

    const p = await models.Project.create({
      name: project["fields"]["Name"],
      accessToken: project["fields"]["Access Token"],
      adminAccessToken: project["fields"]["Admin Access Token"],
    });
  }

  console.log("Done!");
})();


