const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var Project = sequelize.import("../models/project.js");
var Category = sequelize.import("../models/category.js");
var Selection = sequelize.import("../models/selection.js");
var Option = sequelize.import("../models/option.js");
var OptionImage = sequelize.import("../models/optionimage.js");

var Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY })
var base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

async function addCategory(category, projectId) {
  let c;
  try {
    c = await Category.create({
      name: category["fields"]["Name"],
      order: category["fields"]["Order"],
      project_id: projectId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addSelection(selection, categoryId) {
  let c;
  try {
    c = await Selection.create({
      room: selection["fields"]["Room"],
      type: selection["fields"]["Type"],
      location: selection["fields"]["Location"],
      notes: selection["fields"]["Notes"],
      order: selection["fields"]["Order"],
      category_id: categoryId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addOption(option, selectionId) {
  let c;
  try {
    c = await Option.create({
      name: option["fields"]["Name"],
      type: option["fields"]["Type"],
      url: option["fields"]["URL"],
      info: option["fields"]["Info"],
      order: option["fields"]["Order"],
      selection_id: selectionId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

async function addOptionImage(optionImage, optionId) {
  let c;
  try {
    c = await OptionImage.create({
      url: optionImage["url"],
      option_id: optionId,
    });
  } catch (e) {
    console.log(e);
  }

  return c;
}

(async () => {
  console.log("Migrating...");

  var projects = await base("Projects").select({ }).all();

  for (var k in projects) {
    const project = projects[k];
    const p = await Project.create({
      name: project["fields"]["Name"],
      accessToken: project["fields"]["Access Token"],
      adminAccessToken: project["fields"]["Admin Access Token"],
    });

    const categoryIds = project["fields"]["Categories"] || [];

    for (var i in categoryIds) {
      var category = await base("Categories").find(categoryIds[i]);
      var c = await addCategory(category, p.id);

      const selectionIds = category["fields"]["Selections"] || [];
      for (var j in selectionIds) {
        var selection = await base("Selections").find(selectionIds[j]);
        var s = await addSelection(selection, c.id);

        const optionIds = selection["fields"]["Options"] || [];
        for (var l in optionIds) {
          var option = await base("Options").find(optionIds[l]);
          var o = await addOption(option, s.id);

          var images = option["fields"]["Image"] || [];
          for (var h in images) {
            var oi = await addOptionImage(images[h], o.id);
          }
        }
      }
    }
  }

  console.log("Done!");
})();

