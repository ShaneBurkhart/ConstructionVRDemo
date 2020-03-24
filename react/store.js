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

const addNewOption = (state, action) => {
  var selectionOptions = state.selections[action.selectionId]["fields"]["Options"] || [];

  selectionOptions.push(action.id);
  state.selections[action.selectionId]["fields"]["Options"] = selectionOptions;

  state.options[action.id] = { id: action.id, fields: action.newOption };
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

const updateOption = (state, action) => {
  const { optionId, fieldsToUpdate } = action;
  const newFields = { ...state.options[optionId]["fields"], ...fieldsToUpdate };

  state.options[optionId]["fields"] = newFields;
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

const batchUpdateOptions = (state, action) => {
  const { updates } = action;

  (updates || []).forEach(update => {
    const optionId = update["id"];
    const fieldsToUpdate = update["fields"];
    const oldFields = state.options[optionId]["fields"];
    const newFields = { ...oldFields, ...fieldsToUpdate };
    const oldSelectionId = (oldFields["Selections"] || [])[0];
    const newSelectionId = (fieldsToUpdate["Selections"] || [])[0];

    state.options[optionId]["fields"] = newFields;

    // Move option if has new selection. Remove from old, add to new.
    // Order doesn't matter since that's a computed property.
    if (newSelectionId && oldSelectionId != newSelectionId) {
      const oldOptions = state.selections[oldSelectionId]["fields"]["Options"] || [];
      const newOptions = state.selections[newSelectionId]["fields"]["Options"] || [];
      const oldIndex = oldOptions.findIndex(s => s == optionId);

      if (oldIndex >= 0) {
        oldOptions.splice(oldIndex, 1);
        state.selections[oldSelectionId]["fields"]["Options"] = oldOptions;
      }

      if (!newOptions.includes(optionId)) {
        newOptions.push(optionId);
        state.selections[newSelectionId]["fields"]["Options"] = newOptions;
      }
    }
  });

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

      if (oldIndex >= 0) {
        oldSelections.splice(oldIndex, 1);
        state.categories[oldCategoryId]["fields"]["Selections"] = oldSelections;
      }

      if (!newSelections.includes(selectionId)) {
        newSelections.push(selectionId);
        state.categories[newCategoryId]["fields"]["Selections"] = newSelections;
      }
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

const moveSelection = (state, action) => {
  const { selectionId, destCategoryId, newPosition } = action;
  const selection = state.selections[selectionId]
  const sourceCategoryId = selection["fields"]["Category"][0];
  const sourceCategory = state.categories[sourceCategoryId];
  const destCategory = state.categories[destCategoryId];
  const allSourceCategorySelections = state.orderedSelectionIdsByCategoryId[sourceCategoryId];
  let allDestCategorySelections = allSourceCategorySelections;
  let destSelectionId = null;

  if (sourceCategoryId != destCategoryId) {
    allDestCategorySelections = state.orderedSelectionIdsByCategoryId[destCategoryId];
  }

  // Remove id from source category selections
  // Remove after finding indexes
  const sourceIndex = allSourceCategorySelections.findIndex(s => s == selectionId);
  allSourceCategorySelections.splice(sourceIndex, 1);

  // Add id to dest category selections
  allDestCategorySelections.splice(newPosition, 0, selectionId);

  // Update order of source category selections
  sourceCategory["fields"]["Selections"] = allSourceCategorySelections;
  allSourceCategorySelections.forEach((id, i) => {
    state.selections[id]["fields"]["Order"] = i;
  });
  if (sourceCategoryId != destCategoryId) {
    // Update orders of dest category selections
    destCategory["fields"]["Selections"] = allDestCategorySelections;
    allDestCategorySelections.forEach((id, i) => {
      state.selections[id]["fields"]["Order"] = i;
    });
  }

  return { ...computeState({ ...state }) }
}

const moveOption = (state, action) => {
  const { optionId, destSelectionId, newPosition } = action;
  const option = state.options[optionId]
  const sourceSelectionId = option["fields"]["Selections"][0];
  const sourceSelection = state.selections[sourceSelectionId];
  const destSelection = state.selections[destSelectionId];
  const allSourceSelectionOptions = state.orderedOptionIdsBySelectionId[sourceSelectionId];
  let allDestSelectionOptions = allSourceSelectionOptions;

  if (sourceSelectionId != destSelectionId) {
    allDestSelectionOptions = state.orderedOptionIdsBySelectionId[destSelectionId];
  }

  // Remove id from source selection options
  const sourceIndex = allSourceSelectionOptions.findIndex(o => o == optionId);
  allSourceSelectionOptions.splice(sourceIndex, 1);
  // Add id to dest selection options
  allDestSelectionOptions.splice(newPosition, 0, optionId);

  // Update order of source selection options
  sourceSelection["fields"]["Options"] = allSourceSelectionOptions;
  allSourceSelectionOptions.forEach((id, i) => {
    state.options[id]["fields"]["Order"] = i;
  });
  if (sourceSelectionId != destSelectionId) {
    // Update orders of dest selection options
    destSelection["fields"]["Options"] = allDestSelectionOptions;
    allDestSelectionOptions.forEach((id, i) => {
      state.options[id]["fields"]["Order"] = i;
    });
  }

  return { ...computeState({ ...state }) }
}

const todos = (state = {}, action) => {
  console.log(action);

  switch (action.type) {
    case Actions.ADD_NEW_OPTION:
      return addNewOption(state, action);
    case Actions.ADD_NEW_SELECTION:
      return addNewSelection(state, action);
    case Actions.ADD_NEW_CATEGORY:
      return addNewCategory(state, action);
    case Actions.REMOVE_SELECTION:
      return removeSelection(state, action);
    case Actions.REMOVE_CATEGORY:
      return removeCategory(state, action);
    case Actions.UPDATE_OPTION:
      return updateOption(state, action);
    case Actions.UPDATE_SELECTION:
      return updateSelection(state, action);
    case Actions.UPDATE_CATEGORY:
      return updateCategory(state, action);
    case Actions.MOVE_SELECTION:
      return moveSelection(state, action);
    case Actions.MOVE_CATEGORY:
      return moveCategory(state, action);
    case Actions.BATCH_UPDATE_OPTIONS:
      return batchUpdateOptions(state, action);
    case Actions.BATCH_UPDATE_SELECTIONS:
      return batchUpdateSelections(state, action);
    case Actions.MOVE_SELECTION:
      return moveSelection(state, action);
    case Actions.MOVE_OPTION:
      return moveOption(state, action);

    case 'UPDATE_FILTER':
      return { ...computeState({ ...state, filter: action.filter }) };
    case 'UPDATE_MODAL':
      return { ...state, modals: { ...state.modals, ...action.modals }};
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

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);
