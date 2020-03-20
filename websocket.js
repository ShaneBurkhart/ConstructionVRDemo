var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var Airtable = require('airtable');
Airtable.configure({ apiKey: process.env.AIRTABLES_API_KEY })
var base = Airtable.base(process.env.RENDERING_AIRTABLE_APP_ID);

var Actions = require("./common/actions.js");

async function addNewCategory(categoryName, projectAccessToken) {
  try {
    var projectResults = await base("Projects").select({
      filterByFormula: `FIND(\"${projectAccessToken}\", {Access Token}) >= 1`
    }).all();
    var project = projectResults[0];
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

io.on('connection', function(socket){
  console.log('a user connected');

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
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
