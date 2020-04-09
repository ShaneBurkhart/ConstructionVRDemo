import React from 'react';
import { connect } from 'react-redux'
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import FinishSelectionFilters from './FinishSelectionFilters';
import FinishSelectionCategoryTable from './FinishSelectionCategoryTable';
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

  onDragEndSelection = (result) => {
    console.log(result);
    const { orderedSelectionIdsByCategoryId, filteredOrderedSelectionIdsByCategoryId, currentFilter } = this.props;
    const { source, destination } = result;
    if (!destination) return;
    // Picked it up and dropped it in the same spot.
    if (source.droppableId == destination.droppableId && source.index == destination.index) return;


    if (result["type"] == "SELECTION") {
      const selectionId = result.draggableId;
      const destCategoryId = destination.droppableId;
      const destFilteredOrderedSelectionIds = filteredOrderedSelectionIdsByCategoryId[destCategoryId];
      const destAllOrderedSelectionIds = orderedSelectionIdsByCategoryId[destCategoryId];
      let newPosition = destination.index;

      if (currentFilter != "All") {
        // If we have a filter set,
        // Find real index from filtered index. Find the card we place it after.
        if (newPosition < destFilteredOrderedSelectionIds.length) {
          const destSelectionId = destFilteredOrderedSelectionIds[newPosition];
          newPosition = destAllOrderedSelectionIds.findIndex(s => s == destSelectionId);
        } else {
          // Put after the selection we moved it after.
          const destSelectionId = destFilteredOrderedSelectionIds[newPosition - 1];
          newPosition = destAllOrderedSelectionIds.findIndex(s => s == destSelectionId) + 1;
        }
      }

      ActionCreators.moveSelection(selectionId, destCategoryId, newPosition);
    } else if (result["type"] == "OPTION") {
      const [random, optionId] = result.draggableId.split("/");
      const [destCategory, destSelectionId] = destination.droppableId.split("/");

      ActionCreators.moveOption(optionId, destSelectionId, destination.index);
    } else if (result["type"] == "CATEGORY") {
      const { orderedCategoryIds } = this.props;
      const categoryId = result.draggableId;
      const newOrderedCategoryIds = Array.from(orderedCategoryIds);

      const [toMove] = newOrderedCategoryIds.splice(source.index, 1);
      newOrderedCategoryIds.splice(destination.index, 0, toMove);

      ActionCreators.moveCategory(categoryId, destination.index);
    }

    this._isDragging = false;
  }

  renderCategorySections() {
    const { orderedCategoryIds } = this.props;
    const { currentFilter } = this.props;

    return orderedCategoryIds.map((categoryId, i) => {
      const key = categoryId;

      return (
        <FinishSelectionCategoryTable
          key={categoryId}
          categoryId={categoryId}
          onClickOption={this.onClickOption}
        />
      )
    });
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
    const { orderedCategoryIds } = this.props;
    const wrapperClasses = ["xlarge-container", adminMode ? "admin-mode" : ""];

    return (
      <AdminContext.Provider value={adminMode}>
        <DragDropContext onDragEnd={this.onDragEndSelection} onDragStart={this.onDragStartSelection} >
          {adminMode && <FinishCategoriesDrawer
            orderedCategoryIds={orderedCategoryIds}
          />}
          <div className={wrapperClasses.join(" ")}>
            {this.renderCategorySections()}

            <div className="modal-container">
              {adminMode && this.renderOptionModal()}
              {adminMode && this.renderLinkOptionToSelectionModal()}
              {this.renderLoading()}
            </div>
          </div>
        </DragDropContext>
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
    orderedSelectionIdsByCategoryId: reduxState.orderedSelectionIdsByCategoryId,
    filteredOrderedSelectionIdsByCategoryId: reduxState.filteredOrderedSelectionIdsByCategoryId,
  };
}, null)(App);
