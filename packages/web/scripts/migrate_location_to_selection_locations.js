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

async function addSelectionLocation(selectionId, projectId, location) {
  let c;

  try {
    c = await models.SelectionLocation.create({
      location: location,
      SelectionId: selectionId,
      ProjectId: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

(async () => {
  console.log("Migrating...");

  var selections = await models.Selection.findAll();
  await wait(1000);

  for (var k in selections) {
    const selection = selections[k];
    let location = selection.location;
    if (selection.room && selection.room.toLowerCase() != "all") location += " - " + selection.room;
    const p = await addSelectionLocation(selection.id, selection.ProjectId, location);
  }

  console.log("Done!");
})();


