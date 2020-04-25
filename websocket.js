var _ = require('underscore');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  path: "/d30c4db9-008a-42ce-bbc2-3ec95d8c2c45",
});

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@pg:5432/mydb')
var models = require("./models/index.js");

var Actions = require("./common/actions.js");

const redis = require('redis')
const session = require('express-session')

app.set('view engine', 'pug')

app.use(express.urlencoded());

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

const authenticate = (req, res, next) => {
  if (!req.user) return res.redirect("/login");
  next();
}

app.use((req, res, next) => {
  const userId = req.session["user_id"];
  if (userId) {
    models.User.findAll({ where: { id: userId } }).then(results => {
      const user = results[0];
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

if (process.env.NODE_ENV == "development") {
  app.get("/api2/login", (req, res) => {
    res.render("login");
  });
}

app.get("/projects", authenticate, (req, res) => {
  const user = req.user;
  Promise.all([
    user.getOwnedTeams({
      include: [ { model: models.Project } ],
      order: [[ models.Project, "updatedAt",  "desc" ]]
    }),
    user.getEditorTeams({ include: [ { model: models.Project } ] }),
  ]).then(results => {
    res.render("Projects", { ownedTeam: results[0][0], memberTeams: results[1] });
  });
});

app.get("/projects/:access_token/finishes", (req, res) => {
  const projectAccessToken = req.params["access_token"];

  models.Project.findAll({
    where: { accessToken: projectAccessToken }
  }).then(projects => {
    const project = projects[0];
    res.render("project_finishes", { project });
  });
});

app.get("/projects/new", authenticate, (req, res) => {
  const user = req.user;

  user.getOwnedTeams().then(async (ownedTeams) => {
    const ownedTeam = ownedTeams[0];
    if (!ownedTeam) return res.redirect("/projects");

    const newProject = await ownedTeam.createProject({ name: "New Project" });
    const newCategories = await Promise.all([
      newProject.createCategory({ name: "Concepts", order: 1 }),
      newProject.createCategory({ name: "Paint", order: 2 }),
      newProject.createCategory({ name: "Tile", order: 3 }),
      newProject.createCategory({ name: "Light Fixtures", order: 4 }),
      newProject.createCategory({ name: "Furniture", order: 5 }),
    ]);
    const newSelections = await Promise.all([
      newCategories[0].createSelection({ ProjectId: newProject.id, type: "Lounge", order: 1 }),
      newCategories[1].createSelection({ ProjectId: newProject.id, type: "PT1", order: 1 }),
      newCategories[1].createSelection({ ProjectId: newProject.id, type: "PT2", order: 2 }),
      newCategories[2].createSelection({ ProjectId: newProject.id, type: "T1", order: 1 }),
      newCategories[2].createSelection({ ProjectId: newProject.id, type: "T2", order: 2 }),
    ]);

    res.redirect(`/projects/${newProject.accessToken}/finishes`);
  });
});

app.get("/api2/finishes/options/search", function (req, res) {
  const adminMode = !!req.session["is_admin"];
  const searchQuery = req.query["q"] || "";
  const dbSearchQuery = `%${searchQuery}%`

  models.Option.findAll({
    attributes: [[ sequelize.fn('min', sequelize.col('id')), "id" ], 'name', "type", "info", "unitPrice", "manufacturer", "itemNum", "style", "size" ],
    where: {
      [Sequelize.Op.or]: {
        name: { [Sequelize.Op.iLike]: dbSearchQuery },
        type: { [Sequelize.Op.iLike]: dbSearchQuery },
        info: { [Sequelize.Op.iLike]: dbSearchQuery }
      }
    },
    group: [ "name", "type", "info", "unitPrice", "manufacturer", "itemNum", "style", "size" ],
    limit: 100,
  }).then(function (idResults) {
    models.Option.findAll({
      where: { id: idResults.map(r => r.id) },
      include: [ { model: models.OptionImage } ]
    }).then(results => {
      res.json({ options: results });
    });
  });
});

app.get("/api2/project/:access_token/finishes", function (req, res) {
  const projectAccessToken = req.params["access_token"];
  const user = req.user;

  _findProjectByAccessToken(projectAccessToken).then(function (project) {
    Promise.all([
      project.getCategories(),
      project.getSelections(),
      project.getOptions(),
      project.getOptionImages(),
      project.getSelectionLocations(),
      models.TeamMembership.canUserEditProject(user, project),
    ]).then(function (results) {
      res.json({
        projectName: project.name,
        categories: results[0],
        selections: results[1],
        options: results[2],
        optionImages: results[3],
        selectionLocations: results[4],
        admin_mode: results[5],
      });
    });
  });
});

app.post("/api2/login", function (req, res) {
  const email = (req.body.email || "").toLowerCase();
  const password = req.body.password;

  models.User.login(email, password).then(user => {
    if (!user) return res.redirect("/login");

    req.session["user_id"] = user.id;

    res.redirect("/projects");
  });
});

app.post("/api2/create/user_email", function (req, res) {
  const email = req.body.email;

  models.User.findAll({ where: { email: email } }).then(async (userResults) => {
    let user = userResults[0];

    if (!user) {
      const isValid = /[^@]+@[^\.]+\..+/.test(email);
      if (!isValid) return res.redirect(`/create/user_email?email_error=${encodeURIComponent("Invalid email format.")}`);
      // Create user w/ email
      user = await models.User.create({ email: email });
    }

    await user.refreshConfirmationCode();

    // Save to session for later access
    req.session["create_user_id"] = user.id;

    res.redirect("/create/user_email");
  });
});

app.post("/api2/create/confirm_email", function (req, res) {
  const code = req.body.code;
  const createUserId = req.session["create_user_id"];
  if (!createUserId) return res.redirect("/create/user_email");

  models.User.findAll({ where: { id: createUserId } }).then(async (userResults) => {
    let user = userResults[0];
    if (!user) return res.redirect("/create/user_email");
    if (!await user.confirmEmail(code)) return res.redirect("/create/confirm_email");
    res.redirect("/create/team");
  });
});

app.post("/api2/create/team", function (req, res) {
  const team_name = req.body.team_name;
  const createUserId = req.session["create_user_id"];
  if (!createUserId) return res.redirect("/create/user_email");
  if (!team_name) return res.redirect("/create/team");

  req.session["create_team_name"] = team_name;

  res.redirect("/create/user_details");
});

app.post("/api2/create/user_details", function (req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  const createUserId = req.session["create_user_id"];
  const createTeamName = req.session["create_team_name"];
  if (!createUserId) return res.redirect("/create/user_email");
  if (!createTeamName) return res.redirect("/create/team");

  if (!firstName || !lastName) return res.redirect("/create/user_details");
  if (!password || !models.User.validatePassword(password)) return res.redirect("/create/user_details");

  models.User.findAll({ where: { id: createUserId } }).then(async (userResults) => {
    let user = userResults[0];
    if (!user) return res.redirect("/create/user_email");

    user.firstName = firstName;
    user.lastName = lastName;
    await user.setPassword(password);
    await user.save();

    const ownedTeams = await user.getOwnedTeams();
    if (ownedTeams && ownedTeams.length > 0) return res.redirect("/create/user_email");

    const team = await models.Team.create({ name: createTeamName });
    await user.addOwnedTeam(team);

    res.redirect("http://app.finishvision.com/projects");
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
      ...fields,
      SelectionId: selectionId,
      ProjectId: selection.ProjectId,
      order: (selectionOptions || []).length,
    });

    if (fields.Images) {
      for (var i in fields.Images) {
        const img = fields.Images[i];
        const optionImage = await models.OptionImage.create({
          ProjectId: selection.ProjectId,
          OptionId: newOption.id,
          url: img["url"]
        });
      }
    }
  } catch (e) {
    console.log(e);
  }

  const optionResults = await models.Option.findAll({
    where: { id: newOption.id },
    include: [ { model: models.OptionImage } ]
  });

  return optionResults[0];
}

async function addNewSelection(categoryId, fields) {
  let updates;

  try {
    const categoryResults = await models.Category.findAll({
      where: { id: categoryId }
    });
    const category = categoryResults[0];
    const categorySelections = await category.getSelections();
    const newFields = {
      type: "New Selection",
      location: "Amenities",
      room: "Study Lounge",
      ...fields,
      CategoryId: category.id,
      ProjectId: category.ProjectId,
      order: (categorySelections || []).length,
    };

    newSelection = await models.Selection.create(newFields);

    if (fields.order != undefined && fields.order != null && fields.order >= 0) {
      updates = await moveSelection(newSelection.id, categoryId, 0);
      const newIndex = updates.findIndex(u => u.id == newSelection.id);
      updates[newIndex] = { id: newSelection.id, fields: { ...newFields, ...updates[newIndex].fields } }
    } else {
      updates = [{ id: newSelection.id, fields: newFields }];
    }

  } catch (e) {
    console.log(e);
  }

  return updates;
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

async function removeOption(optionId) {
  try {
    // Only unlink so the option stays in the library.
    await models.Option.update({ ProjectId: null, SelectionId: null }, { where: { id: optionId } });
  } catch (e) {
    console.log(e);
  }
}

async function removeSelection(selectionId) {
  try {
    await models.Selection.destroy({ where: { id: selectionId } });
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
    const optionResults = await models.Option.findAll({ where: { id: optionId } });
    const option = optionResults[0];
    const projectId = option.ProjectId;
    const updates = [{
      "id": optionId,
      "fields": fieldsToUpdate,
    }];

    if (updateAll) {
      const optionName = option.name;
      const optionsWithSameName = await models.Option.findAll({
        where: { name: optionName, ProjectId: projectId }
      });

      optionsWithSameName.forEach(option => {
        if (option.id == optionId) return;
        // Remove id when updating other option records
        const copyFieldsToUpdate = { ...fieldsToUpdate, id: undefined };

        if (fieldsToUpdate.Images) {
          copyFieldsToUpdate.Images = fieldsToUpdate.Images.map(i => ({ url: i["url"] }));
        }

        updates.push({
          "id": option.id,
          "fields": copyFieldsToUpdate,
        });
      });
    }

    const updatePromises = [];
    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      const images = update["fields"].Images;

      await models.Option.update(update["fields"], {
        where: { id: update["id"] }
      });

      if (images) {
        const imageIds = images.map(img => img.id).filter(i => !!i);
        const whereClause = {
          OptionId: update["id"]
        };

        if (imageIds && imageIds.length) whereClause[Sequelize.Op.not] = { id: imageIds };
        // Destroy all option images that aren't in update
        await models.OptionImage.destroy({ where: whereClause })

        for (var j = 0; j < images.length; j++) {
          const img = images[j];
          if (!img.id) {
            const optionImage = await models.OptionImage.create({
              ProjectId: update["fields"].ProjectId,
              OptionId: update["id"],
              url: img.url
            });
            images[j] = optionImage;
          }
        }
      }
    }

    return updates;
  } catch (e) {
    console.log(e);
  }
}

async function updateSelection(selectionId, fieldsToUpdate) {
  try {
    const selectionLocations = fieldsToUpdate.SelectionLocations;

    await models.Selection.update(fieldsToUpdate, {
      where: { id: selectionId }
    });
    const selectionResults = await models.Selection.findAll({
      where: { id: selectionId }
    });
    const selection = selectionResults[0];

    if (selectionLocations) {
      const ids = selectionLocations.map(i => i.id).filter(i => !!i);
      const whereClause = { SelectionId: selectionId };

      if (ids && ids.length) whereClause[Sequelize.Op.not] = { id: ids };
      // Destroy all option images that aren't in update
      await models.SelectionLocation.destroy({ where: whereClause })

      for (var j = 0; j < selectionLocations.length; j++) {
        const sl = selectionLocations[j];
        if (!sl.id) {
          const selectionLocation = await models.SelectionLocation.create({
            ProjectId: selection.ProjectId,
            SelectionId: selectionId,
            location: sl.location
          });
          selectionLocations[j] = selectionLocation;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

async function updateCategory(categoryId, fieldsToUpdate) {
  try {
    await models.Category.update(fieldsToUpdate, {
      where: { id: categoryId }
    });
  } catch (e) {
    console.log(e);
  }
}

async function updateProject(projectAccessToken, fieldsToUpdate) {
  try {
    await models.Project.update(_.pick(fieldsToUpdate, "name"), {
      where: { accessToken: projectAccessToken }
    });
  } catch (e) {
    console.log(e);
  }
}

async function alphabetizeSelections(categoryId) {
  let updates;

  try {
    const selections = await models.Selection.findAll({
      where: { CategoryId: categoryId },
    });

    updates = (selections || []).sort((a, b) => (
      a.type.localeCompare(b.type)
    )).map((s, i) => ({
      id: s.id,
      fields: { order: i }
    }));

    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      await models.Selection.update(update["fields"], {
        where: { id: update["id"] }
      });
    }
  } catch (e) {
    console.log(e);
  }

  return updates;
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

    console.log(sourceOptions);
    console.log(sourceSelectionId, destSelectionId);

    sourceOptions.forEach((s, i) => console.log(s["id"]));

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

    for (var i = 0; i < updates.length; i++) {
      const update = updates[i];
      console.log(update);
      await models.Option.update(update["fields"], {
        where: { id: update["id"] }
      })
    }

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

  const projectAccessToken = socket.handshake.query.projectAccessToken;
  socket.join(projectAccessToken)


  const userId = socket.request.session["user_id"];
  if (!userId) return;

  Promise.all([
    models.User.findAll({ where: { id: userId } }),
    models.Project.findAll({ where: { accessToken: projectAccessToken } }),
  ]).then(async (results) => {
    const user = results[0][0];
    const project = results[1][0];

    if (!models.TeamMembership.canUserEditProject(user, project)) return;

    socket.on(Actions.ADD_NEW_OPTION, function(data){
      addNewOption(data.selectionId, data.fields).then((newOption) => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          id: newOption.id,
          newOption: newOption,
          type: Actions.ADD_NEW_OPTION,
          ...data,
        });
      });
    });

    socket.on(Actions.ADD_NEW_SELECTION, function(data){
      addNewSelection(data.categoryId, data.fields).then((updates) => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          updates: updates,
          type: Actions.BATCH_UPDATE_SELECTIONS,
          ...data,
        });
      });
    });

    socket.on(Actions.ADD_NEW_CATEGORY, function(data){
      addNewCategory(data.categoryName, data.project_token).then((newCategory) => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          id: newCategory.id,
          newCategory: newCategory,
          type: Actions.ADD_NEW_CATEGORY,
          ...data,
        });
      });
    });

    socket.on(Actions.REMOVE_OPTION, function(data){
      removeOption(data.optionId).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.REMOVE_OPTION,
          ...data,
        });
      });
    });

    socket.on(Actions.REMOVE_SELECTION, function(data){
      removeSelection(data.selectionId).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.REMOVE_SELECTION,
          ...data,
        });
      });
    });

    socket.on(Actions.REMOVE_CATEGORY, function(data){
      removeCategory(data.categoryId).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.REMOVE_CATEGORY,
          ...data,
        });
      });
    });

    socket.on(Actions.UPDATE_OPTION, function(data){
      updateOption(data.optionId, data.fieldsToUpdate, data.updateAll).then((updates) => {
        if (data.updateAll) {
          io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
            type: Actions.BATCH_UPDATE_OPTIONS, ...data, updates
          });
        } else {
          io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
            type: Actions.UPDATE_OPTION, ...data
          });
        }
      });
    });

    socket.on(Actions.UPDATE_SELECTION, function(data){
      updateSelection(data.selectionId, data.fieldsToUpdate).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.UPDATE_SELECTION,
          ...data,
        });
      });
    });

    socket.on(Actions.UPDATE_CATEGORY, function(data){
      updateCategory(data.categoryId, data.fieldsToUpdate).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.UPDATE_CATEGORY,
          ...data,
        });
      });
    });

    socket.on(Actions.UPDATE_PROJECT, function(data){
      updateProject(projectAccessToken, data.fieldsToUpdate).then(() => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.UPDATE_PROJECT,
          ...data,
        });
      });
    });

    socket.on(Actions.ALPHABETIZE_SELECTIONS, function(data){
      alphabetizeSelections(data.categoryId).then((updates) => {
        io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
          type: Actions.BATCH_UPDATE_SELECTIONS, ...data, updates,
        });
      });
    });

    socket.on(Actions.MOVE_OPTION, function(data){
      const { optionId, destSelectionId, newPosition, project_token } = data;
      moveOption(optionId, destSelectionId, newPosition, project_token)
        .then((updates) => {
          io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
            type: Actions.BATCH_UPDATE_OPTIONS, ...data, updates,
          });
        });
    });

    socket.on(Actions.MOVE_SELECTION, function(data){
      const { selectionId, destCategoryId, newPosition, project_token } = data;
      moveSelection(selectionId, destCategoryId, newPosition, project_token)
        .then((updates) => {
          io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
            type: Actions.BATCH_UPDATE_SELECTIONS, ...data, updates,
          });
        });
    });

    socket.on(Actions.MOVE_CATEGORY, function(data){
      moveCategory(data.categoryId, data.newPosition, data.project_token)
        .then((updates) => {
          io.to(projectAccessToken).emit(Actions.EXECUTE_CLIENT_EVENT, {
            type: Actions.BATCH_UPDATE_CATEGORIES, ...data, updates
          });
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

if (require.main === module) {
  http.listen(3000, function(){
    _testPostgresConnection().then(function () {
      console.log('listening on *:3000');
    });
  });
}

module.exports = app;
