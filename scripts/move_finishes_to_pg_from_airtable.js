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

  var projects = await base("Projects").select({ filterByFormula: "{Name} = 'Olivette'" }).all();
  await wait(1000);
  var categories = await base("Categories").select({ }).all();
  await wait(1000);
  var selections = await base("Selections").select({ }).all();
  await wait(1000);
  var options = await base("Options").select({ }).all();
  await wait(1000);

  for (var k in projects) {
    const project = projects[k];
    //var project = await base("Projects").find("recpKqIt1OcoBNe62");
    //const p = await models.Project.create({
      //name: project["fields"]["Name"],
      //accessToken: project["fields"]["Access Token"],
      //adminAccessToken: project["fields"]["Admin Access Token"],
    //});
    const pResults = await models.Project.findAll({
      where: {
        accessToken: project["fields"]["Access Token"],
      }
    }).all();
    const p = pResults[0];

    const categoryIds = project["fields"]["Categories"] || [];

    for (var i in categoryIds) {
      if (categoryIds[i] != "rec6AnPeWrnuzPGuc") continue;
      var category = categories.find(c => c["id"] == categoryIds[i]);
      var c = await addCategory(category, p.id);

      const selectionIds = category["fields"]["Selections"] || [];
      for (var j in selectionIds) {
        var selection = selections.find(c => c["id"] == selectionIds[j]);
        var s = await addSelection(selection, c.id, p.id);

        const optionIds = selection["fields"]["Options"] || [];
        for (var l in optionIds) {
          var option = options.find(c => c["id"] == optionIds[l]);
          var o = await addOption(option, s.id, p.id);

          var images = option["fields"]["Image"] || [];
          for (var h in images) {
            var oi = await addOptionImage(images[h], o.id, p.id);
          }
        }
      }
    }
  }

  console.log("Done!");
})();

