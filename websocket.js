var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  path: "/d30c4db9-008a-42ce-bbc2-3ec95d8c2c45",
});
//var io = require('socket.io')(http);

var Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY })
var base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

var Actions = require("./common/actions.js");

async function _findProjectByAccessToken(projectAccessToken) {
  var projectResults = await base("Projects").select({
    filterByFormula: `FIND(\"${projectAccessToken}\", {Access Token}) >= 1`
  }).all();
  return projectResults[0];
}

async function addNewOption(selectionId, fields) {
  try {
    var selection = await base("Selections").find(selectionId);
    var newOption = await base("Options").create([
      { "fields": {
        "Selections": [ selection["id"] ],
        "Order": (selection.fields["Options"] || []).length,
        ...fields,
      } }
    ]);
  } catch (e) {
    console.log(e);
  }

  return newOption[0];
}

async function addNewSelection(categoryId) {
  try {
    var category = await base("Categories").find(categoryId);
    var newSelection = await base("Selections").create([
      { "fields": {
        "Type": "New Selection",
        "Location": "Amenities",
        "Room": "Study Lounge",
        "Category": [ category["id"] ],
        "Order": (category.fields["Selections"] || []).length,
      } }
    ]);
  } catch (e) {
    console.log(e);
  }

  return newSelection[0];
}

async function addNewCategory(categoryName, projectAccessToken) {
  try {
    var project = await _findProjectByAccessToken(projectAccessToken);
    var newCategory = await base("Categories").create([
      { "fields": {
        "Name": categoryName,
        "Project": [ project.id ],
        "Order": project.fields["Categories"].length,
      } }
    ]);
  } catch (e) {
    console.log(e);
  }

  return newCategory[0];
}

async function removeSelection(selectionId) {
  try {
    await base("Selections").destroy([ selectionId ]);
  } catch (e) {
    console.log(e);
  }
}

async function removeCategory(categoryId) {
  try {
    await base("Categories").destroy([ categoryId ]);
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
      const optionName = fieldsToUpdate["Name"];
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
    const option = await base("Options").find(optionId);
    const sourceSelectionId = option["fields"]["Selections"][0];
    const sourceOptions = await base("Options").select({
      filterByFormula: `{Selection ID} = \"${sourceSelectionId}\"`,
      sort: [{ field: "Order", direction: "asc" }],
    }).all();
    let destOptions = sourceOptions;

    if (sourceSelectionId != destSelectionId) {
      destOptions = await base("Options").select({
        filterByFormula: `{Selection ID} = \"${destSelectionId}\"`,
        sort: [{ field: "Order", direction: "asc" }],
      }).all();
    }

    const sourceIndex = sourceOptions.findIndex(s => s["id"] == optionId);
    const [toMove] = sourceOptions.splice(sourceIndex, 1);

    destOptions.splice(newPosition, 0, toMove);

    const updates = [];
    sourceOptions.forEach((s, i) => updates.push({
      "id": s["id"],
      "fields": { "Order": i, "Selections": [ sourceSelectionId ] },
    }));
    if (sourceSelectionId != destSelectionId) {
      destOptions.forEach((s, i) => updates.push({
        "id": s["id"],
        "fields": { "Order": i, "Selections": [ destSelectionId ] },
      }));
    }

    const chunks = [];
    const chunkSize = 10;
    for (var i = 0; i < updates.length; i += chunkSize) {
        const updatesChunk = updates.slice(i,i + chunkSize);
        chunks.push(base("Options").update(updatesChunk));
    }

    await Promise.all(chunks);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

async function moveSelection(selectionId, destCategoryId, newPosition, projectAccessToken) {
  try {
    const selection = await base("Selections").find(selectionId);
    const sourceCategoryId = selection["fields"]["Category"][0];
    const sourceSelections = await base("Selections").select({
      filterByFormula: `{Category ID} = \"${sourceCategoryId}\"`,
      sort: [{ field: "Order", direction: "asc" }],
    }).all();
    let destSelections = sourceSelections;

    if (sourceCategoryId != destCategoryId) {
      destSelections = await base("Selections").select({
        filterByFormula: `{Category ID} = \"${destCategoryId}\"`,
        sort: [{ field: "Order", direction: "asc" }],
      }).all();
    }

    const sourceIndex = sourceSelections.findIndex(s => s["id"] == selectionId);
    const [toMove] = sourceSelections.splice(sourceIndex, 1);

    destSelections.splice(newPosition, 0, toMove);

    const updates = [];
    sourceSelections.forEach((s, i) => updates.push({
      "id": s["id"],
      "fields": { "Order": i, "Category": [ sourceCategoryId ] },
    }));
    if (sourceCategoryId != destCategoryId) {
      destSelections.forEach((s, i) => updates.push({
        "id": s["id"],
        "fields": { "Order": i, "Category": [ destCategoryId ] },
      }));
    }

    const chunks = [];
    const chunkSize = 10;
    for (var i = 0; i < updates.length; i += chunkSize) {
        const updatesChunk = updates.slice(i,i + chunkSize);
        chunks.push(base("Selections").update(updatesChunk));
    }

    await Promise.all(chunks);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

async function moveCategory(categoryId, newPosition, projectAccessToken) {
  try {
    var project = await _findProjectByAccessToken(projectAccessToken);
    var categories = await base("Categories").select({
      filterByFormula: `{Project ID} = \"${project.id}\"`
    }).all();

    const orderedCategories = Object.values(categories)
            .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])

    const startIndex = orderedCategories.findIndex(c => c["id"] == categoryId);
    const [category] = orderedCategories.splice(startIndex, 1);
    orderedCategories.splice(newPosition, 0, category);

    const updates = orderedCategories.map((c, i) => {
      return { "id": c["id"], "fields": { "Order": i } };
    });

    const chunks = [];
    const chunkSize = 10;
    for (var i = 0; i < updates.length; i += chunkSize) {
        const updatesChunk = updates.slice(i,i + chunkSize);
        chunks.push(base("Categories").update(updatesChunk));
    }

    await Promise.all(chunks);
    return updates;
  } catch (e) {
    console.log(e);
  }
}

io.on('connection', function(socket){
  console.log('New Connections!');

  socket.on(Actions.ADD_NEW_OPTION, function(data){
    addNewOption(data.selectionId, data.fields).then((newOption) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newOption.id,
        newOption: newOption.fields,
        type: Actions.ADD_NEW_OPTION,
        ...data,
      });
    });
  });

  socket.on(Actions.ADD_NEW_SELECTION, function(data){
    addNewSelection(data.categoryId).then((newSelection) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newSelection.id,
        newSelection: newSelection.fields,
        type: Actions.ADD_NEW_SELECTION,
        ...data,
      });
    });
  });

  socket.on(Actions.ADD_NEW_CATEGORY, function(data){
    addNewCategory(data.categoryName, data.project_token).then((newCategory) => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        id: newCategory.id,
        newCategory: newCategory.fields,
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
    moveCategory(data.categoryId, data.newPosition, data.project_token).then(() => {
      io.emit(Actions.EXECUTE_CLIENT_EVENT, {
        type: Actions.MOVE_CATEGORY,
        ...data,
      });
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
