var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  path: "/d30c4db9-008a-42ce-bbc2-3ec95d8c2c45",
});

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var models = require("./models/index.js");

var Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY })
var base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

var Actions = require("./common/actions.js");

const redis = require('redis')
const session = require('express-session')

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient(6379, "redis")
let sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: '0e409cf7-0aed-4189-96f3-13a80a3c5675',
  resave: false,
});

app.use(sessionMiddleware);
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.get("/api2/project/:access_token/finishes", function (req, res) {
  const projectAccessToken = req.params["access_token"];
  const adminMode = !!req.session["is_admin"];
  _findProjectByAccessToken(projectAccessToken).then(function (project) {
    Promise.all([
      project.getCategories(),
      project.getSelections(),
      project.getOptions(),
      project.getOptionImages(),
    ]).then(function (results) {
      res.json({
        admin_mode: adminMode,
        categories: results[0],
        selections: results[1],
        options: results[2],
        optionImages: results[3],
      });
    });
  });
});

app.get("/api2/admin/login/:admin_token", function (req, res) {
  const adminToken = req.params["admin_token"];
  const project = _findProjectByAdminToken(adminToken)
  if (!project) return res.status(404).send('Not found');

  let redirect_to = req.query["redirect_to"];
  if (!redirect_to || redirect_to.length == 0) {
    redirect_to = `/project/${project["fields"]["Access Token"]}`
  }

  req.session["is_admin"] = true;

  res.redirect(redirect_to);
});

async function _findProjectByAdminToken(projectAdminToken) {
  const projectResults = await models.Project.findAll({
    where: { adminAccessToken: projectAdminToken },
  });
  return projectResults[0];
}

async function _findProjectByAccessToken(projectAccessToken) {
  const projectResults = await models.Project.findAll({
    where: { accessToken: projectAccessToken },
  });
  return projectResults[0];
}

async function addNewOption(selectionId, fields) {
  let newOption;

  try {
    var selectionResults = await models.Selection.findAll({
      where: { id: selectionId }
    });
    const selection = selectionResults[0];
    const selectionOptions = await selection.getOptions();

    newOption = await models.Option.create({
      SelectionId: selection.id,
      ProjectId: selection.ProjectId,
      order: (selectionOptions || []).length,
      ...fields,
    });
  } catch (e) {
    console.log(e);
  }

  return newOption;
}

async function addNewSelection(categoryId, fields) {
  let newSelection;

  try {
    const categoryResults = await models.Category.findAll({
      where: { id: categoryId }
    });
    const category = categoryResults[0];
    const categorySelections = await category.getSelections();

    newSelection = await models.Selection.create({
      type: "New Selection",
      location: "Amenities",
      room: "Study Lounge",
      ...fields,
      CategoryId: category.id,
      ProjectId: category.ProjectId,
      order: (categorySelections || []).length,
    });
  } catch (e) {
    console.log(e);
  }

  return newSelection;
}

async function addNewCategory(categoryName, projectAccessToken) {
  let newCategory;

  try {
    var project = await _findProjectByAccessToken(projectAccessToken);
    const projectCategories = await project.getCategories();

    newCategory = await models.Category.create({
      name: categoryName,
      ProjectId: project.id,
      order: (projectCategories || []).length,
    });
  } catch (e) {
    console.log(e);
  }

  return newCategory;
}

async function removeSelection(selectionId) {
  try {
    await models.Selection.destroy({ where: { id: selectionId }});
  } catch (e) {
    console.log(e);
  }
}

async function removeCategory(categoryId) {
  try {
    await models.Category.destroy({ where: { id: categoryId } });
  } catch (e) {
    console.log(e);
  }
}

async function updateOption(optionId, fieldsToUpdate, updateAll) {
  try {
    const option = await base("Options").find(optionId);
    const projectId = option["fields"]["Project IDs"];
    const updates = [{
      "id": optionId,
      "fields": fieldsToUpdate,
    }];

    if (updateAll) {
      const optionName = option["fields"]["Name"];
      const optionsWithSameName = await base("Options").select({
        filterByFormula: `AND(FIND(\"${optionName}\", {Name}) >= 1, FIND(\"${projectId}\", {Project IDs}) >= 1)`,
      }).all();

      optionsWithSameName.forEach(option => {
        if (option["id"] == optionId) return;
        const copyFieldsToUpdate = { ...fieldsToUpdate };

        if (fieldsToUpdate["Image"]) {
          copyFieldsToUpdate["Image"] = fieldsToUpdate["Image"].map(i => ({ url: i["url"] }));
        }

        updates.push({
          "id": option["id"],
          "fields": copyFieldsToUpdate,
        });
      });
    }

    const chunks = [];
    const chunkSize = 10;
    for (var i = 0; i < updates.length; i += chunkSize) {
        const updatesChunk = updates.slice(i,i + chunkSize);
        chunks.push(base("Options").update(updatesChunk));
    }

    await Promise.all(chunks);
    return updates;
    await base("Options").update([]);
  } catch (e) {
    console.log(e);
  }
}

async function updateSelection(selectionId, fieldsToUpdate) {
  try {
    await base("Selections").update([{
      "id": selectionId,
      "fields": fieldsToUpdate,
    }]);
  } catch (e) {
    console.log(e);
  }
}

async function updateCategory(categoryId, fieldsToUpdate) {
  try {
    await base("Categories").update([{
      "id": categoryId,
      "fields": fieldsToUpdate,
    }]);
  } catch (e) {
    console.log(e);
  }
}

async function moveOption(optionId, destSelectionId, newPosition, projectAccessToken) {
  try {
    const optionResults = await models.Option.findAll({ where: { id: optionId } });
    const option = optionResults[0];
    const sourceSelectionId = option.SelectionId;
    const sourceOptions = await models.Option.findAll({
      where: { SelectionId: sourceSelectionId },
      order:[[ "order", "asc" ]]
    });
    let destOptions = sourceOptions;

    if (sourceSelectionId != destSelectionId) {
      destOptions = await models.Option.findAll({
        where: { SelectionId: destSelectionId },
        order:[[ "order", "asc" ]]
      });
    }

    const sourceIndex = sourceOptions.findIndex(s => s["id"] == optionId);
    const [toMove] = sourceOptions.splice(sourceIndex, 1);

    destOptions.splice(newPosition, 0, toMove);

    const updates = [];
    sourceOptions.forEach((s, i) => updates.push({
      "id": s["id"],
      "fields": { order: i, SelectionId: sourceSelectionId },
    }));
    if (sourceSelectionId != destSelectionId) {
      destOptions.forEach((s, i) => updates.push({
        "id": s["id"],
        "fields": { order: i, SelectionId: destSelectionId },
      }));
    }

    const updatePromises = [];
    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      updatePromises.push(models.Option.update(update["fields"], {
        where: { id: update["id"] }
      }))
    }

    await Promise.all(updatePromises);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

async function moveSelection(selectionId, destCategoryId, newPosition, projectAccessToken) {
  try {
    const selectionResults = await models.Selection.findAll({ where: { id: selectionId } });
    const selection = selectionResults[0];
    const sourceCategoryId = selection.CategoryId;
    const sourceSelections = await models.Selection.findAll({
      where: { CategoryId: sourceCategoryId },
      order:[[ "order", "asc" ]]
    });
    let destSelections = sourceSelections;

    if (sourceCategoryId != destCategoryId) {
      destSelections = await models.Selection.findAll({
        where: { CategoryId: destCategoryId },
        order:[[ "order", "asc" ]]
      });
    }

    const sourceIndex = sourceSelections.findIndex(s => s["id"] == selectionId);
    const [toMove] = sourceSelections.splice(sourceIndex, 1);

    destSelections.splice(newPosition, 0, toMove);

    const updates = [];
    sourceSelections.forEach((s, i) => updates.push({
      "id": s["id"],
      "fields": { order: i, CategoryId: sourceCategoryId },
    }));
    if (sourceCategoryId != destCategoryId) {
      destSelections.forEach((s, i) => updates.push({
        "id": s["id"],
        "fields": { order: i, CategoryId: destCategoryId },
      }));
    }

    const updatePromises = [];
    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      updatePromises.push(models.Selection.update(update["fields"], {
        where: { id: update["id"] }
      }))
    }

    await Promise.all(updatePromises);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

async function moveCategory(categoryId, newPosition, projectAccessToken) {
  try {
    var project = await _findProjectByAccessToken(projectAccessToken);
    var orderedCategories = await models.Category.findAll({
      where: { ProjectId: project.id },
      order:[[ "order", "asc" ]]
    });

    const startIndex = orderedCategories.findIndex(c => c["id"] == categoryId);
    const [category] = orderedCategories.splice(startIndex, 1);
    orderedCategories.splice(newPosition, 0, category);

    const updates = orderedCategories.map((c, i) => {
      return { id: c.id, "fields": { order: i } };
    });

    const updatePromises = [];
    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      updatePromises.push(models.Category.update(update["fields"], {
        where: { id: update["id"] }
      }))
    }

    await Promise.all(updatePromises);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

io.on('connection', function(socket){
  console.log('New Connections!');
  if (!socket.request.session["is_admin"]) {
    // Updates only connection.  No write access unless is_admin.
    return;
  }

  socket.on(Actions.ADD_NEW_OPTION, function(data){
    addNewOption(data.selectionId, data.fields).then((newOption) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newOption.id,
        newOption: newOption,
        type: Actions.ADD_NEW_OPTION,
        ...data,
      });
    });
  });

  socket.on(Actions.ADD_NEW_SELECTION, function(data){
    addNewSelection(data.categoryId, data.fields).then((newSelection) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newSelection.id,
        newSelection: newSelection,
        type: Actions.ADD_NEW_SELECTION,
        ...data,
      });
    });
  });

  socket.on(Actions.ADD_NEW_CATEGORY, function(data){
    addNewCategory(data.categoryName, data.project_token).then((newCategory) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newCategory.id,
        newCategory: newCategory,
        type: Actions.ADD_NEW_CATEGORY,
        ...data,
      });
    });
  });

  socket.on(Actions.REMOVE_SELECTION, function(data){
    removeSelection(data.selectionId).then(() => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        type: Actions.REMOVE_SELECTION,
        ...data,
      });
    });
  });

  socket.on(Actions.REMOVE_CATEGORY, function(data){
    removeCategory(data.categoryId).then(() => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        type: Actions.REMOVE_CATEGORY,
        ...data,
      });
    });
  });

  socket.on(Actions.UPDATE_OPTION, function(data){
    updateOption(data.optionId, data.fieldsToUpdate, data.updateAll).then((updates) => {
      if (data.updateAll) {
        io.emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.BATCH_UPDATE_OPTIONS, ...data, updates
        });
      } else {
        io.emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.UPDATE_OPTION, ...data
        });
      }
    });
  });

  socket.on(Actions.UPDATE_SELECTION, function(data){
    updateSelection(data.selectionId, data.fieldsToUpdate).then(() => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        type: Actions.UPDATE_SELECTION,
        ...data,
      });
    });
  });

  socket.on(Actions.UPDATE_CATEGORY, function(data){
    updateCategory(data.categoryId, data.fieldsToUpdate).then(() => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        type: Actions.UPDATE_CATEGORY,
        ...data,
      });
    });
  });

  socket.on(Actions.MOVE_OPTION, function(data){
    const { optionId, destSelectionId, newPosition, project_token } = data;
    moveOption(optionId, destSelectionId, newPosition, project_token)
      .then((updates) => {
        io.emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.BATCH_UPDATE_OPTIONS, ...data, updates,
        });
      });
  });

  socket.on(Actions.MOVE_SELECTION, function(data){
    const { selectionId, destCategoryId, newPosition, project_token } = data;
    moveSelection(selectionId, destCategoryId, newPosition, project_token)
      .then((updates) => {
        io.emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.BATCH_UPDATE_SELECTIONS, ...data, updates,
        });
      });
  });

  socket.on(Actions.MOVE_CATEGORY, function(data){
    moveCategory(data.categoryId, data.newPosition, data.project_token)
      .then((updates) => {
        io.emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.BATCH_UPDATE_CATEGORIES, ...data, updates
        });
      });
  });
});

async function _testPostgresConnection () {
  try {
    await sequelize.authenticate();
    console.log('Postgres connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

http.listen(3000, function(){
  _testPostgresConnection().then(function () {
    console.log('listening on *:3000');
  });
});
