import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';

const _initialState = {
  filter: "All",
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

  return newState;
}

const todos = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_FILTER':
      return {
        ...computeState({ ...state, filter: action.filter })
      };
    case 'MOVE_SELECTION':
      const { selectionId, source, destination } = action;
      const sourceCategoryId = source.droppableId;
      const destCategoryId = destination.droppableId;
      const sourceCategory = state.categories[sourceCategoryId];
      const destCategory = state.categories[destCategoryId];
      const allSourceCategorySelections = state.orderedSelectionIdsByCategoryId[sourceCategoryId];
      const filteredDestCategorySelections = state.filteredOrderedSelectionIdsByCategoryId[destCategoryId];
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
      console.log(destSelectionIndex);
      allDestCategorySelections.splice(destSelectionIndex, 0, selectionId);

      // Update order of source category selections
      sourceCategory["fields"]["Selections"] = allSourceCategorySelections;
      allSourceCategorySelections.forEach((id, i) => {
        state.selections[id]["fields"]["Order"] = i;
      });
      // Update orders of dest category selections
      destCategory["fields"]["Selections"] = allDestCategorySelections;
      allDestCategorySelections.forEach((id, i) => {
        state.selections[id]["fields"]["Order"] = i;
      });

      return {
        ...computeState({ ...state }),
      }
    case 'FULL_UPDATE':
      const filter = state.filter;
      const options = indexByID(action.options);
      const selections = indexByID(action.selections);
      const categories = indexByID(action.categories);

      return {
        ...computeState({ filter, options, selections, categories }),
        isAdmin: action.admin_mode,
      }
    default:
      return state
  }
}

export default createStore(
  todos,
  _initialState,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  ),
);
