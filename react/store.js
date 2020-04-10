import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk';
import ActionCreators from './action_creators';
import Actions from '../common/actions'

const _initialState = {
  isAdmin: false,
  filters: {
    locations: null,
  },
  modals: {},
};

const indexByID = (arr) => {
  return arr.reduce((memo,b) => ({...memo, [b["id"]]: b }), {});
}

const computeState = (newState) => {
  const filters = newState.filters;
  const options = newState.options;
  const selections = newState.selections;
  const categories = newState.categories;

  const locations = {};
  Object.values(newState.selections).forEach((selection) => {
    const selectionLocations = selection.SelectionLocations || [];
    selectionLocations.forEach(sl => {
      const l = sl.location;
      if (l && !locations[l]) locations[l] = true;
    });
  });
  newState.selectionFilters = { locations: Object.keys(locations) };

  const wordDensity = {};
  Object.keys(locations).forEach(l => {
    const parts = l.split(/\s+/) || [];
    parts.forEach(p => {
      if (!p.match(/[a-zA-Z]/)) return;
      wordDensity[p] = (wordDensity[p] || 0) + 1;
    });
  });
  const sortedQuickSearches = Object.keys(wordDensity)
    .map(k=>[k,wordDensity[k]])
    .sort((a,b)=>b[1]-a[1])
    .map(a=>a[0]);
  newState.quickSearches = { locations: sortedQuickSearches };

  if (filters.locations == null) {
    filters.locations = [];
    newState.filters = filters;
  }

  // Ordered Categories
  newState.orderedCategoryIds = Object.values(categories)
      .sort((a,b) => a.order - b.order)
      .map(c => c.id);

  // Ordered Selections
  newState.orderedSelectionIdsByCategoryId = {};
  newState.filteredOrderedSelectionIdsByCategoryId = {};
  newState.orderedCategoryIds.forEach((categoryId) => {
    const category = categories[categoryId];
    const selectionsForCategory = (category.Selections || [])
        .map(s => (selections[s]));
    const orderedSelectionIds = selectionsForCategory
        .sort((a,b) => a.order - b.order)
        .map(s => s.id);
    const filteredOrderedSelectionIds = selectionsForCategory
        .filter((s) => {
          const selectionLocations = s.SelectionLocations || [];
          // Show all if no filters
          if (filters.locations.length == 0) return true;
          // Show unspecified always
          if (selectionLocations.length == 0) return true;
          return selectionLocations.map(sl=>(
            filters.locations.map(l=>sl.location.includes(l)).includes(true)
          )).includes(true);
        }).sort((a,b) => a.order - b.order)
        .map(s => s.id);
    newState.filteredOrderedSelectionIdsByCategoryId[categoryId] = filteredOrderedSelectionIds;
    newState.orderedSelectionIdsByCategoryId[categoryId] = orderedSelectionIds;
  });

  // Ordered Options
  newState.orderedOptionIdsBySelectionId = {};
  Object.keys(selections).forEach((selectionId) => {
    const selection = selections[selectionId];
    const optionsForSelection = (selection.Options || [])
        .map(o => (options[o]));
    const orderedOptionIds= optionsForSelection
        .sort((a,b) => a.order - b.order)
        .map(o => o.id);
    newState.orderedOptionIdsBySelectionId[selectionId] = orderedOptionIds;
  });

  return newState;
}

const addNewOption = (state, action) => {
  var newSelection = { ...state.selections[action.selectionId] };
  var selectionOptions = [ ...(newSelection.Options || []) ];

  selectionOptions.push(action.id);
  newSelection.Options = selectionOptions;
  state.selections[action.selectionId] = newSelection;

  const newOption = { id: action.id, ...action.newOption };
  newOption.Images = newOption.OptionImages;
  state.options[action.id] = newOption;

  return { ...state, ...computeState({ ...state }) };
}

const addNewSelection = (state, action) => {
  const newCategory = { ...state.categories[action.categoryId] };
  var categorySelections = [ ...(newCategory.Selections || []) ];

  categorySelections.push(action.id);
  newCategory.Selections = categorySelections;
  state.categories[action.categoryId] = newCategory;

  state.selections[action.id] = { id: action.id, ...action.newSelection };
  return { ...state, ...computeState({ ...state }) };
}

const addNewCategory = (state, action) => {
  state.categories[action.id] = { id: action.id, ...action.newCategory };
  return { ...state, ...computeState({ ...state }) };
}

const removeOption = (state, action) => {
  const option = state.options[action.optionId];
  const selectionId = option.SelectionId;
  const selection = { ...state.selections[selectionId] };
  const selectionOptions = [ ...(selection.Options || []) ];

  selectionOptions.splice(selectionOptions.indexOf(action.optionId), 1);
  selection.Options = selectionOptions;
  state.selections[selectionId] = selection;

  delete state.options[action.optionId];

  return { ...state, ...computeState({ ...state }) };
}

const removeSelection = (state, action) => {
  const selection = state.selections[action.selectionId];
  const categoryId = selection.CategoryId;
  const category = { ...state.categories[categoryId] };
  const categorySelections = [ ...(category.Selections || []) ];

  categorySelections.splice(categorySelections.indexOf(action.selectionId), 1);
  category.Selections = categorySelections;
  state.categories[categoryId] = category

  delete state.selections[action.selectionId];

  return { ...state, ...computeState({ ...state }) };
}

const removeCategory = (state, action) => {
  delete state.categories[action.categoryId];
  return { ...state, ...computeState({ ...state }) };
}

const updateOption = (state, action) => {
  const { optionId, fieldsToUpdate } = action;
  const newFields = { ...state.options[optionId], ...fieldsToUpdate };

  state.options[optionId] = newFields;
  return { ...state, ...computeState({ ...state }) };
}

const updateSelection = (state, action) => {
  const { selectionId, fieldsToUpdate } = action;
  const newFields = { ...state.selections[selectionId], ...fieldsToUpdate };

  state.selections[selectionId] = newFields;
  return { ...state, ...computeState({ ...state }) };
}

const updateCategory = (state, action) => {
  const { categoryId, fieldsToUpdate } = action;
  const newFields = { ...state.categories[categoryId], ...fieldsToUpdate };

  state.categories[categoryId] = newFields;
  return { ...state, ...computeState({ ...state }) };
}

const batchUpdateOptions = (state, action) => {
  const { updates } = action;

  (updates || []).forEach(update => {
    const optionId = update["id"];
    const fieldsToUpdate = update["fields"];
    const oldFields = state.options[optionId];
    const newFields = { ...oldFields, ...fieldsToUpdate };
    const oldSelectionId = oldFields.SelectionId;
    const newSelectionId = fieldsToUpdate.SelectionId;

    state.options[optionId] = newFields;

    // Move option if has new selection. Remove from old, add to new.
    // Order doesn't matter since that's a computed property.
    if (newSelectionId && oldSelectionId != newSelectionId) {
      const oldOptions = [ ...(state.selections[oldSelectionId].Options || []) ];
      const newOptions = [ ...(state.selections[newSelectionId].Options || []) ];
      const oldIndex = oldOptions.findIndex(s => s == optionId);
      let newSelection;

      if (oldIndex >= 0) {
        newSelection = { ...state.selections[oldSelectionId] };

        oldOptions.splice(oldIndex, 1);
        newSelection.Options = oldOptions;

        state.selections[oldSelectionId] = newSelection;
      }

      if (!newOptions.includes(optionId)) {
        newSelection = state.selections[newSelectionId];

        newOptions.push(optionId);
        newSelection.Options = newOptions;

        state.selections[newSelectionId] = newSelection;
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
    const oldFields = state.selections[selectionId] || {};
    const newFields = {
      SelectionLocations: [], ...oldFields, ...fieldsToUpdate, id: selectionId
    };
    const oldCategoryId = oldFields.CategoryId;
    const newCategoryId = fieldsToUpdate.CategoryId;

    state.selections[selectionId] = newFields;

    // Move selection if has new category. Remove from old, add to new.
    // Order doesn't matter since that's a computed property.
    if (newCategoryId && oldCategoryId != newCategoryId) {
      const oldSelections = [ ...((state.categories[oldCategoryId] || {}).Selections || []) ];
      const newSelections = [ ...(state.categories[newCategoryId].Selections || []) ];
      const oldIndex = oldSelections.findIndex(s => s == selectionId);
      let newCategory;

      if (oldIndex >= 0) {
        newCategory = { ...state.categories[oldCategoryId] };

        oldSelections.splice(oldIndex, 1);
        newCategory.Selections = oldSelections;

        state.categories[oldCategoryId] = newCategory;
      }

      if (!newSelections.includes(selectionId)) {
        newCategory = { ...state.categories[newCategoryId] };

        newSelections.push(selectionId);
        newCategory.Selections = newSelections;

        state.categories[newCategoryId] = newCategory;
      }
    }
  });

  return { ...state, ...computeState({ ...state }) };
}

const batchUpdateCategories = (state, action) => {
  const { updates } = action;

  (updates || []).forEach(update => {
    const categoryId = update["id"];
    const fieldsToUpdate = update["fields"];
    const oldFields = state.categories[categoryId];
    const newFields = { ...oldFields, ...fieldsToUpdate };

    state.categories[categoryId] = newFields;
  });

  return { ...state, ...computeState({ ...state }) };
}

const moveCategory = (state, action) => {
  const { categoryId, newPosition } = action;
  const orderedCategories = Object.values(state.categories)
          .sort((a,b) => a.order - b.order)

  const startIndex = orderedCategories.findIndex(c => c["id"] == categoryId);
  const [category] = orderedCategories.splice(startIndex, 1);
  orderedCategories.splice(newPosition, 0, category);

  orderedCategories.forEach((c, i) => {
    const newCategory = { ...state.categories[c.id] };
    newCategory.order = i;
    state.categories[c.id] = newCategory;
  });
  return { ...state, ...computeState({ ...state }) };
}

const moveSelection = (state, action) => {
  const { selectionId, destCategoryId, newPosition } = action;
  const selection = state.selections[selectionId]
  const sourceCategoryId = selection.CategoryId;
  const sourceCategory = { ...state.categories[sourceCategoryId] };
  const destCategory = { ...state.categories[destCategoryId] };
  const allSourceCategorySelections = [ ...state.orderedSelectionIdsByCategoryId[sourceCategoryId] ];
  let allDestCategorySelections = allSourceCategorySelections;
  let destSelectionId = null;

  if (sourceCategoryId != destCategoryId) {
    allDestCategorySelections = [ ...state.orderedSelectionIdsByCategoryId[destCategoryId] ];
  }

  // Remove id from source category selections
  // Remove after finding indexes
  const sourceIndex = allSourceCategorySelections.findIndex(s => s == selectionId);
  allSourceCategorySelections.splice(sourceIndex, 1);

  // Add id to dest category selections
  allDestCategorySelections.splice(newPosition, 0, selectionId);

  // Update order of source category selections
  allSourceCategorySelections.forEach((id, i) => {
    const newSelection = { ...state.selections[id] };
    newSelection.order = i;
    newSelection.CategoryId = sourceCategory.id;
    state.selections[id] = newSelection
  });
  sourceCategory.Selections = allSourceCategorySelections;
  state.categories[sourceCategoryId] = sourceCategory;

  if (sourceCategoryId != destCategoryId) {
    // Update orders of dest category selections
    allDestCategorySelections.forEach((id, i) => {
      const newSelection = { ...state.selections[id] };
      newSelection.order = i;
      newSelection.CategoryId = destCategory.id;
      state.selections[id] = newSelection
    });
    destCategory.Selections = allDestCategorySelections;
    state.categories[destCategoryId] = destCategory;
  }

  return { ...computeState({ ...state }) }
}

const moveOption = (state, action) => {
  const { optionId, destSelectionId, newPosition } = action;
  const option = state.options[optionId]
  const sourceSelectionId = option.SelectionId;
  const sourceSelection = { ...state.selections[sourceSelectionId] };
  const destSelection = { ...state.selections[destSelectionId] };
  const allSourceSelectionOptions = [ ...state.orderedOptionIdsBySelectionId[sourceSelectionId] ];
  let allDestSelectionOptions = allSourceSelectionOptions;

  if (sourceSelectionId != destSelectionId) {
    allDestSelectionOptions = [ ...state.orderedOptionIdsBySelectionId[destSelectionId] ];
  }

  // Remove id from source selection options
  const sourceIndex = allSourceSelectionOptions.findIndex(o => o == optionId);
  allSourceSelectionOptions.splice(sourceIndex, 1);
  // Add id to dest selection options
  allDestSelectionOptions.splice(newPosition, 0, optionId);

  // Update order of source selection options
  allSourceSelectionOptions.forEach((id, i) => {
    const newOption = { ...state.options[id] };
    newOption.order = i;
    newOption.SelectionId = sourceSelection.id;
    state.options[id] = newOption;
  });
  sourceSelection.Options = allSourceSelectionOptions;
  state.selections[sourceSelectionId] = sourceSelection;

  if (sourceSelectionId != destSelectionId) {
    // Update orders of dest selection options
    allDestSelectionOptions.forEach((id, i) => {
      const newOption = { ...state.options[id] };
      newOption.order = i;
      newOption.SelectionId = destSelection.id;
      state.options[id] = newOption;
    });
    destSelection.Options = allDestSelectionOptions;
    state.selections[destSelectionId] = destSelection;
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
    case Actions.REMOVE_OPTION:
      return removeOption(state, action);
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
    case Actions.BATCH_UPDATE_OPTIONS:
      return batchUpdateOptions(state, action);
    case Actions.BATCH_UPDATE_SELECTIONS:
      return batchUpdateSelections(state, action);
    case Actions.BATCH_UPDATE_CATEGORIES:
      return batchUpdateCategories(state, action);
    case Actions.MOVE_CATEGORY:
      return moveCategory(state, action);
    case Actions.MOVE_SELECTION:
      return moveSelection(state, action);
    case Actions.MOVE_OPTION:
      return moveOption(state, action);

    case Actions.UPDATE_FILTERS:
      return { ...computeState({ ...state, filters: { ...state.filters, ...action.filters } }) };
    case 'UPDATE_MODAL':
      return { ...state, modals: { ...state.modals, ...action.modals }};
    case 'FULL_UPDATE':
      const filters = state.filters;
      const options = indexByID(action.options);
      const selections = indexByID(action.selections);
      const categories = indexByID(action.categories);

      Object.keys(categories).forEach(categoryId => {
        const categorySelections = action.selections.reduce((memo, s) => {
          if (s.CategoryId == categoryId) memo.push(s.id); return memo;
        }, [])
        categories[categoryId].Selections = categorySelections;
      });

      Object.keys(selections).forEach(selectionId => {
        const selectionOptions = action.options.reduce((memo, o) => {
          if (o.SelectionId == selectionId) memo.push(o.id); return memo;
        }, [])
        const selectionLocations = action.selectionLocations.reduce((memo, sl) => {
          if (sl.SelectionId == selectionId) memo.push(sl); return memo;
        }, [])
        selections[selectionId].Options = selectionOptions;
        selections[selectionId].SelectionLocations = selectionLocations;
      });

      Object.keys(options).forEach(optionId => {
        const optionImages = action.optionImages.reduce((memo, oi) => {
          if (oi.OptionId == optionId) memo.push(oi); return memo;
        }, [])
        options[optionId].Images = optionImages;
      });

      return {
        ...state,
        ...computeState({ filters, options, selections, categories }),
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
