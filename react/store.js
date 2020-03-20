import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';
import ActionCreators from './action_creators';
import Actions from '../common/actions'

const _initialState = {
  isAdmin: false,
  filter: "All",
  modals: {},
};

const indexByID = (arr) => {
  return arr.reduce((memo,b) => ({...memo, [b["id"]]: b }), {});
}

const computeState = (newState) => {
  const filter = newState.filter;
  const options = newState.options;
  const selections = newState.selections;
  const categories = newState.categories;

  // Ordered Categories
  newState.orderedCategoryIds = Object.values(categories)
      .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])
      .map(c => c["id"]);

  // Ordered Selections
  newState.orderedSelectionIdsByCategoryId = {};
  newState.filteredOrderedSelectionIdsByCategoryId = {};
  newState.orderedCategoryIds.forEach((categoryId) => {
    const category = categories[categoryId];
    const selectionsForCategory = (category["fields"]["Selections"] || [])
        .map(s => (selections[s]));
    const orderedSelectionIds = selectionsForCategory
        .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])
        .map(s => s["id"]);
    const filteredOrderedSelectionIds = selectionsForCategory
        .filter((s) => (filter == null || filter == "All" || s["fields"]["Location"] == filter))
        .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])
        .map(s => s["id"]);
    newState.filteredOrderedSelectionIdsByCategoryId[categoryId] = filteredOrderedSelectionIds;
    newState.orderedSelectionIdsByCategoryId[categoryId] = orderedSelectionIds;
  });

  // Ordered Options
  newState.orderedOptionIdsBySelectionId = {};
  Object.keys(selections).forEach((selectionId) => {
    const selection = selections[selectionId];
    const optionsForSelection = (selection["fields"]["Options"] || [])
        .map(o => (options[o]));
    const orderedOptionIds= optionsForSelection
        .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])
        .map(o => o["id"]);
    newState.orderedOptionIdsBySelectionId[selectionId] = orderedOptionIds;
  });

  const locations = {};
  Object.values(newState.selections).forEach((selection) => {
    const l = selection["fields"]["Location"];
    if (l && !locations[l]) locations[l] = true;
  });
  newState.selectionFilters = Object.keys(locations);

  return newState;
}

const reorderCategories = (state, action) => {
  const { orderedCategoryIds } = action;

  (orderedCategoryIds || []).forEach((cId, i) => {
    state.categories[cId]["fields"]["Order"] = i;
    state.categories[cId]["dirty"] = true;
  });

  return { ...computeState({ ...state }) };
};

const moveSelection = (state, action) => {
  const { selectionId, source, destination } = action;
  const sourceCategoryId = source.droppableId;
  const destCategoryId = destination.droppableId;
  const sourceCategory = state.categories[sourceCategoryId];
  const destCategory = state.categories[destCategoryId];
  const allSourceCategorySelections = state.orderedSelectionIdsByCategoryId[sourceCategoryId];
  let allDestCategorySelections = allSourceCategorySelections;
  let destSelectionId = null;
  let destSelectionIndex = null;

  if (sourceCategoryId != destCategoryId) {
    allDestCategorySelections = state.orderedSelectionIdsByCategoryId[destCategoryId];
  }

  if (destination.index < filteredDestCategorySelections.length) {
    destSelectionId = filteredDestCategorySelections[destination.index];
    destSelectionIndex = allDestCategorySelections.findIndex(s => s == destSelectionId);
  } else {
    destSelectionId = filteredDestCategorySelections[destination.index - 1];
    // Put after the selection we moved it after.
    destSelectionIndex = allDestCategorySelections.findIndex(s => s == destSelectionId) + 1;
  }

  // Remove id from source category selections
  // Remove after finding indexes
  const sourceIndex = allSourceCategorySelections.findIndex(s => s == selectionId);
  allSourceCategorySelections.splice(sourceIndex, 1);

  // Add id to dest category selections
  allDestCategorySelections.splice(destSelectionIndex, 0, selectionId);

  // Update order of source category selections
  sourceCategory["fields"]["Selections"] = allSourceCategorySelections;
  sourceCategory["dirty"] = true;
  allSourceCategorySelections.forEach((id, i) => {
    state.selections[id]["fields"]["Order"] = i;
    state.selections[id]["dirty"] = true;
  });
  // Update orders of dest category selections
  destCategory["fields"]["Selections"] = allDestCategorySelections;
  destCategory["dirty"] = true;
  allDestCategorySelections.forEach((id, i) => {
    state.selections[id]["fields"]["Order"] = i;
    state.selections[id]["dirty"] = true;
  });

  return { ...computeState({ ...state }) }
}

const moveOption = (state, action) => {
  const { optionId, source, destination } = action;
  const [sourceCategory, sourceSelectionId] = source.droppableId.split("/");
  const [destCategory, destSelectionId] = destination.droppableId.split("/");
  const sourceSelection = state.selections[sourceSelectionId];
  const destSelection = state.selections[destSelectionId];
  const allSourceSelectionOptions = state.orderedOptionIdsBySelectionId[sourceSelectionId];
  let allDestSelectionOptions = allSourceSelectionOptions;

  if (sourceSelectionId != destSelectionId) {
    allDestSelectionOptions = state.orderedOptionIdsBySelectionId[destSelectionId];
  }

  // Remove id from source selection options
  allSourceSelectionOptions.splice(source.index, 1);
  // Add id to dest selection options
  allDestSelectionOptions.splice(destination.index, 0, optionId);

  // Update order of source selection options
  sourceSelection["fields"]["Options"] = allSourceSelectionOptions;
  sourceSelection["dirty"] = true;
  allSourceSelectionOptions.forEach((id, i) => {
    state.options[id]["fields"]["Order"] = i;
    state.options[id]["dirty"] = true;
  });
  // Update orders of dest selection options
  destSelection["fields"]["Options"] = allDestSelectionOptions;
  destSelection["dirty"] = true;
  allDestSelectionOptions.forEach((id, i) => {
    state.options[id]["fields"]["Order"] = i;
    state.options[id]["dirty"] = true;
  });

  return { ...computeState({ ...state }) }
}

const removeNew = (state, action) => {
  // Remove new ids
  Object.keys(state.categories).forEach(o => { if (o.startsWith("new")) delete state.categories[o]; });
  Object.keys(state.selections).forEach(o => { if (o.startsWith("new")) delete state.selections[o]; });
  Object.keys(state.options).forEach(o => { if (o.startsWith("new")) delete state.options[o]; });
  return { ...state };
};

const removeDeleted = (state, action) => {
  // Remove new ids
  Object.values(state.categories).forEach(o => { if(o["DELETE"]) delete state.categories[o["id"]] });
  Object.values(state.selections).forEach(o => { if(o["DELETE"]) delete state.selections[o["id"]] });
  Object.values(state.options).forEach(o => { if(o["DELETE"]) delete state.options[o["id"]] });
  return { ...state };
};

const eachUpdate = (state, action) => {
  const categories = action.categories || [];
  const selections = action.selections || [];
  const options = action.options || [];

  const dirty = { "dirty": true };
  if (action.serverUpdate) {
    dirty["dirty"] = null;
    state = removeNew(state);
    state = removeDeleted(state);
  }

  categories.forEach(c => {
    const cat = state.categories[c["id"]];
    if (cat) {
      state.categories[c["id"]] = { ...cat, ...c, ...dirty };
    } else {
      state.categories[c["id"]] = { ...c, ...dirty };
    }
  });

  selections.forEach(s => {
    const selection = state.selections[s["id"]];
    if (selection) {
      state.selections[s["id"]] = { ...selection, ...s, ...dirty };
    } else {
      state.selections[s["id"]] = { ...s, ...dirty };
    }
  });

  options.forEach(o => {
    const option = state.options[o["id"]];
    if (option) {
      state.options[o["id"]] = { ...option, ...o, ...dirty };
    } else {
      state.options[o["id"]] = { ...o, ...dirty };
    }
  });

  return { ...state, ...computeState({ ...state }) };
}

const addNewSelection = (state, action) => {
  var categorySelections = state.categories[action.categoryId]["fields"]["Selections"] || [];

  categorySelections.push(action.id);
  state.categories[action.categoryId]["fields"]["Selections"] = categorySelections;

  state.selections[action.id] = { id: action.id, fields: action.newSelection };
  return { ...state, ...computeState({ ...state }) };
}

const addNewCategory = (state, action) => {
  state.categories[action.id] = { id: action.id, fields: action.newCategory };
  return { ...state, ...computeState({ ...state }) };
}

const removeSelection = (state, action) => {
  var selection = state.selections[action.selectionId];
  var categoryId = selection["fields"]["Category"][0];
  var categorySelections = state.categories[categoryId]["fields"]["Selections"] || [];

  categorySelections.splice(categorySelections.indexOf(action.selectionId), 1);
  delete state.selections[action.selectionId];
  return { ...state, ...computeState({ ...state }) };
}

const removeCategory = (state, action) => {
  delete state.categories[action.categoryId];
  return { ...state, ...computeState({ ...state }) };
}

const updateSelection = (state, action) => {
  const { selectionId, fieldsToUpdate } = action;
  const newFields = { ...state.selections[selectionId]["fields"], ...fieldsToUpdate };

  state.selections[selectionId]["fields"] = newFields;
  return { ...state, ...computeState({ ...state }) };
}

const updateCategory = (state, action) => {
  const { categoryId, fieldsToUpdate } = action;
  const newFields = { ...state.categories[categoryId]["fields"], ...fieldsToUpdate };

  state.categories[categoryId]["fields"] = newFields;
  return { ...state, ...computeState({ ...state }) };
}

const batchUpdateSelections = (state, action) => {
  const { updates } = action;

  (updates || []).forEach(update => {
    const selectionId = update["id"];
    const fieldsToUpdate = update["fields"];
    const oldFields = state.selections[selectionId]["fields"];
    const newFields = { ...oldFields, ...fieldsToUpdate };
    const oldCategoryId = (oldFields["Category"] || [])[0];
    const newCategoryId = (fieldsToUpdate["Category"] || [])[0];

    state.selections[selectionId]["fields"] = newFields;

    // Move selection if has new category. Remove from old, add to new.
    // Order doesn't matter since that's a computed property.
    if (newCategoryId && oldCategoryId != newCategoryId) {
      const oldSelections = state.categories[oldCategoryId]["fields"]["Selections"] || [];
      const newSelections = state.categories[newCategoryId]["fields"]["Selections"] || [];
      const oldIndex = oldSelections.findIndex(s => s == selectionId);

      oldSelections.splice(oldIndex, 1);
      state.categories[oldCategoryId]["fields"]["Selections"] = oldSelections;

      newSelections.push(selectionId);
      state.categories[newCategoryId]["fields"]["Selections"] = newSelections;
    }
  });

  return { ...state, ...computeState({ ...state }) };
}

const moveCategory = (state, action) => {
  const { categoryId, newPosition } = action;
  const orderedCategories = Object.values(state.categories)
          .sort((a,b) => a["fields"]["Order"] - b["fields"]["Order"])

  const startIndex = orderedCategories.findIndex(c => c["id"] == categoryId);
  const [category] = orderedCategories.splice(startIndex, 1);
  orderedCategories.splice(newPosition, 0, category);

  orderedCategories.forEach((c, i) => state.categories[c["id"]]["fields"]["Order"] = i);
  return { ...state, ...computeState({ ...state }) };
}

const todos = (state = {}, action) => {
  console.log(action);

  switch (action.type) {
    case Actions.ADD_NEW_SELECTION:
      return addNewSelection(state, action);
    case Actions.ADD_NEW_CATEGORY:
      return addNewCategory(state, action);
    case Actions.REMOVE_SELECTION:
      return removeSelection(state, action);
    case Actions.REMOVE_CATEGORY:
      return removeCategory(state, action);
    case Actions.UPDATE_SELECTION:
      return updateSelection(state, action);
    case Actions.UPDATE_CATEGORY:
      return updateCategory(state, action);
    case Actions.MOVE_SELECTION:
      return moveSelection(state, action);
    case Actions.MOVE_CATEGORY:
      return moveCategory(state, action);
    case Actions.BATCH_UPDATE_SELECTIONS:
      return batchUpdateSelections(state, action);

    case 'UPDATE_FILTER':
      return {
        ...computeState({ ...state, filter: action.filter })
      };
    case 'REORDER_CATEGORIES':
      return reorderCategories(state, action);
    case 'MOVE_OPTION':
      return moveOption(state, action);
    case 'UPDATE_MODAL':
      return { ...state, modals: { ...state.modals, ...action.modals }};
    case 'SERVER_UPDATE':
      return eachUpdate(removeNew(state, action), action);
    case 'EACH_UPDATE':
      return eachUpdate(state, action);
    case 'FULL_UPDATE':
      const filter = state.filter;
      const options = indexByID(action.options);
      const selections = indexByID(action.selections);
      const categories = indexByID(action.categories);

      return {
        ...state,
        ...computeState({ filter, options, selections, categories }),
        isAdmin: action.admin_mode,
      }
    default:
      return state
  }
}

const _getDirty = (obj) => {
  return Object.values(obj).reduce((m, c) => {
    if (c["dirty"] == true) m.push(c);
    return m;
  }, []);
}

const saveToServer = store => next => action => {
  let result = next(action)
  const newState = store.getState();

  // Clean up anything that says it's dirty ;)
  const diff = {
    categories: _getDirty(newState.categories),
    selections: _getDirty(newState.selections),
    options: _getDirty(newState.options),
  }

  const count = Object.keys(diff).reduce((m,o) => {
    m += diff[o].length; return m;
  }, 0);

  //console.log(diff);

  //if (count > 0) store.dispatch(ActionCreators.saveToServer(diff));

  return result;
}

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk, saveToServer),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);