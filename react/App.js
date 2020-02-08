import React from 'react';
import { connect } from 'react-redux'
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';
import FinishCategoriesModal from './FinishCategoriesModal';
import FinishSelectionLinkOptionModal from './FinishSelectionLinkOptionModal';
import FinishAdminSection from './FinishAdminSection';
import FinishOptionModal from './FinishOptionModal';

import './App.css';
import './FinishSelectionTable.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this._isDragging = false;

    this._superSetState = this.setState;
    this.setState = (newState) => {
      this._superSetState(newState);

      if (newState.categories && newState.isLoading === undefined) {
        const categories = newState.categories;
        // Save categories
        this.setState({ isSaving: true })
        ActionCreators.save(categories, _ => this.setState({ isSaving: false }));
      }
    }

    // Keep selection state in here
    this.state = {
      isLoading: false,
      isSaving: false,
      categoriesModal: null,
      selectionModal: null,
      optionModal: null,
      linkOptionToSelectionModal: null,
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    window.addEventListener('beforeunload', this.onUnload);

    this.props.dispatch(ActionCreators.load((data) => {
      this.setState({ isLoading: false });
    }));
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onUnload);
  }

  onUnload = (e) => {
    const { isSaving } = this.state;
    e.preventDefault();

    if (isSaving) {
      e.returnValue = 1;
    }
  }

  onChangeFilter = (filter) => {
    this.props.dispatch(ActionCreators.updateFilter(filter));
  }

  onDragStartSelection = () => {
    this._isDragging = true;
  }

  handleOpenCategoryModalFor = (category) => {
    return _ => this.setState({ categoriesModal: category });
  }

  onDragEndSelection = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    // Picked it up and dropped it in the same spot.
    if (source.droppableId == destination.droppableId && source.index == destination.index) return;

    if (result["type"] == "SELECTION") {
      this.props.dispatch(ActionCreators.moveSelection(result.draggableId, source, destination));
    } else if (result["type"] == "OPTION") {
      const [random, optionId] = result.draggableId.split("/");
      this.props.dispatch(ActionCreators.moveOption(optionId, source, destination));
    }

    this._isDragging = false;
  }

  onSaveCategories = (categories) => {
    const { currentFilter } = this.props;
    const categoriesState = this._getCategoriesState(categories, currentFilter);

    this.setState({
      selectionModal: null,
      optionModal: null,
      categoriesModal: null,
      ...categoriesState
    });
  }

  onSaveCategory = (category) => {
    const { categories } = this.state;
    const { currentFilter } = this.props;
    const catIndex = categories.findIndex(c => c["id"] == category["id"]);
    if (catIndex < 0) return;

    console.log(category);
    const newCategories = Array.from(categories);
    newCategories[catIndex] = _.clone(category);
    const categoriesState = this._getCategoriesState(newCategories, currentFilter);

    this.setState({ ...categoriesState });
  }

  onSaveSelection = (originalCategoryId, selection) => {
    const { selectionsByCategory } = this.state;
    const { currentFilter } = this.props;
    const sourceSelectionsForCat = Array.from(selectionsByCategory[originalCategoryId]);
    const selectionId = selection["id"];
    if (!sourceSelectionsForCat) return;

    const selectionIndex = sourceSelectionsForCat.findIndex(s => s["id"] == selectionId);
    const destCategory = (selection["fields"] || {})["Category"][0];
    let destSelectionsForCat = selectionsByCategory[destCategory];

    if (originalCategoryId == destCategory) {
      if (selectionIndex == -1) {
        // If source selection not found, add to end of dest selections.
        // Not typical path. Shouldn't happen really.
        destSelectionsForCat.push(selection);
      } else {
        destSelectionsForCat[selectionIndex] = selection;
      }
    } else {
      if (selectionIndex != -1) {
        // Remove selection from source if found index
        sourceSelectionsForCat.splice(selectionIndex, 1);
      }

      // Append selection to end of destination.
      destSelectionsForCat = Array.from(selectionsByCategory[destCategory]);
      destSelectionsForCat.push(selection);
    }

    selectionsByCategory[originalCategoryId] = sourceSelectionsForCat;
    selectionsByCategory[destCategory] = destSelectionsForCat;

    const { categories } = this.state;

    // Set updated selections to categories in state and reset
    const newCategories = Object.keys(selectionsByCategory).map(categoryID => {
      const selections = selectionsByCategory[categoryID];
      const category = _.clone(categories.find(c => c.id == categoryID));
      category["Selections"] = selections;
      return category;
    });

    this.setState({
      linkOptionToSelectionModal: null,
      selectionModal: null,
      optionModal: null,
      ...this._getCategoriesState(newCategories, currentFilter)
    });
  }

  onSaveOption = (optionId, optionFields) => {
    const { selectionModal, optionModal } = this.props;
    const optionIdx = selectionModal["Options"].findIndex(o => optionId == o["id"]);
    if (optionIdx < 0) return;

    const newOption = _.extend({}, optionModal, { "fields": optionFields });
    selectionModal["Options"][optionIdx] = newOption;

    this.onSaveSelection(selectionModal["fields"]["Category"][0], selectionModal);
  }

  onUnlinkOption = (selection) => {
    this.onSaveSelection(selection["fields"]["Category"][0], selection);
  }

  onTrashSelection = (category) => {
    this.onSaveCategory(category);
  }

  onClickOption = (option, selection) => {
    if (this._isDragging) return;
    this.setState({ selectionModal: selection, optionModal: option });
  }

  onClickLinkOption = (selection) => {
    if (this._isDragging) return;
    this.setState({ linkOptionToSelectionModal: selection });
  }

  renderCategorySections() {
    const { orderedCategoryIds } = this.props;
    const { filteredSelectionsByCategory } = this.state;
    const { currentFilter } = this.props;

    return orderedCategoryIds.map((categoryId, i) => {
      const key = categoryId;

      return (
        <FinishSelectionCategoryTable
          key={categoryId}
          categoryId={categoryId}
          onClickOption={this.onClickOption}
          onClickLinkOption={this.onClickLinkOption}
          onClickEditCategory={this.handleOpenCategoryModalFor(key)}
          onUnlinkOption={this.onUnlinkOption}
          onTrashSelection={this.onTrashSelection}
          onSaveSelection={this.onSaveSelection}
          onSaveCategory={this.onSaveCategory}
        />
      )
    });
  }

  renderCategoriesModal() {
    const { categories, categoriesModal} = this.state;
    if (!categoriesModal) return "";

    return (
      <FinishCategoriesModal
        key={categoriesModal}
        categories={categories}
        selectedCategory={categoriesModal}
        onClose={_ => this.setState({ categoriesModal: null }) }
        onSave={this.onSaveCategories}
      />
    );
  }

  renderOptionModal() {
    const { optionModal, categories } = this.state;
    if (!optionModal) return "";

    return (
      <FinishOptionModal
        isNew={optionModal["id"].startsWith("new")}
        option={optionModal}
        onClose={_ => this.setState({ optionModal: null }) }
        onSave={this.onSaveOption}
      />
    );
  }

  renderLinkOptionToSelectionModal() {
    const { linkOptionToSelectionModal } = this.state;
    if (!linkOptionToSelectionModal) return "";

    return (
      <FinishSelectionLinkOptionModal
        key={linkOptionToSelectionModal["id"]}
        selection={linkOptionToSelectionModal}
        onClose={_ => this.setState({ linkOptionToSelectionModal: null }) }
        onSave={this.onSaveSelection}
      />
    );
  }

  renderLoading() {
    const { isLoading } = this.state;
    if (!isLoading) return "";

    return (
      <div className="ui inverted dimmer active">
        <div className="ui grey header content">Loading...</div>
      </div>
    );
  }

  render() {
    const { adminMode, selectionFilters, currentFilter } = this.props;
    const wrapperClasses = ["xlarge-container", adminMode ? "admin-mode" : ""];

    return (
      <AdminContext.Provider value={adminMode}>
        {adminMode && <FinishAdminSection
          onClickManageCategories={this.handleOpenCategoryModalFor(true)}
        />}
        <div className={wrapperClasses.join(" ")}>
          <FinishSelectionFilters
            current={currentFilter}
            filters={selectionFilters}
            onChange={this.onChangeFilter}
            />
          <DragDropContext onDragEnd={this.onDragEndSelection} onDragStart={this.onDragStartSelection} >
            {this.renderCategorySections()}
          </DragDropContext>
          <div className="modal-container">
            {adminMode && this.renderCategoriesModal()}
            {adminMode && this.renderOptionModal()}
            {adminMode && this.renderLinkOptionToSelectionModal()}
            {this.renderLoading()}
          </div>
        </div>
      </AdminContext.Provider>
    );
  }
}

export default connect((reduxState, props) => {
  return {
    adminMode: reduxState.isAdmin,
    orderedCategoryIds: reduxState.orderedCategoryIds || [],
    currentFilter: reduxState.filter,
    selectionFilters: reduxState.selectionFilters || [],
  };
}, null)(App);
