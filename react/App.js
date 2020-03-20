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

    ActionCreators.updateDispatch(this.props.dispatch);

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

  handleOpenCategoryModalFor = (categoryId) => {
    return _ => this.props.dispatch(ActionCreators.updateModal({
      reorderCategories: categoryId,
    }));
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
          onClickEditCategory={this.handleOpenCategoryModalFor(key)}
        />
      )
    });
  }

  renderCategoriesModal() {
    const { orderedCategoryIds, reorderCategoriesModal } = this.props;
    if (!reorderCategoriesModal) return "";

    return (
      <FinishCategoriesModal
        key={reorderCategoriesModal}
        orderedCategoryIds={orderedCategoryIds}
        selectedCategory={reorderCategoriesModal}
      />
    );
  }

  renderOptionModal() {
    const { optionIdModal, selectionIdModal } = this.props;
    if (!optionIdModal || !selectionIdModal) return "";

    return (
      <FinishOptionModal
        key={optionIdModal}
        optionId={optionIdModal}
        selectionId={selectionIdModal}
      />
    );
  }

  renderLinkOptionToSelectionModal() {
    const { linkSelectionIdModal } = this.props;
    if (!linkSelectionIdModal) return "";

    return (
      <FinishSelectionLinkOptionModal
        key={linkSelectionIdModal}
        selectionId={linkSelectionIdModal}
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
    optionIdModal: reduxState.modals.optionId,
    selectionIdModal: reduxState.modals.selectionId,
    linkSelectionIdModal: reduxState.modals.linkSelectionId,
    reorderCategoriesModal: reduxState.modals.reorderCategories,
  };
}, null)(App);
