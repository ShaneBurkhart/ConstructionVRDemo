import React from 'react';
import ReactDOM from 'react-dom';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ActionCreators from './action_creators';
import DragDropModal from './DragDropModal';
import FinishCategoryModalCategory from './FinishCategoryModalCategory';
import AdminControls from './AdminControls';

class FinishCategoriesModal extends DragDropModal {
  constructor(props) {
    super(props);

    this._droppableId = Math.random().toString(36).substring(2, 15);

    this.state = {
      orderedCategoryIds: props.orderedCategoryIds,
      selectedCategory: props.selectedCategory
    };
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const { orderedCategoryIds } = this.state;
    const newOrderedCategoryIds = Array.from(orderedCategoryIds);
    if (!destination) return;

    const [removed] = newOrderedCategoryIds.splice(source.index, 1);
    newOrderedCategoryIds.splice(destination.index, 0, removed);

    this.setState({ orderedCategoryIds: newOrderedCategoryIds });
  }

  onSave = () => {
    const { orderedCategoryIds } = this.state;
    this.props.dispatch(ActionCreators.reorderCategories(orderedCategoryIds));
    this.onClose();
  }

  onClose = () => {
    this.props.dispatch(ActionCreators.updateModal({ reorderCategories: null }));
  }

  getDraggableStyle = (draggableStyle, isDragging) => {
    return this.getDraggableStyleOverride(draggableStyle, isDragging);
  }

  render() {
    const { orderedCategoryIds, selectedCategory } = this.state;

    return (
      <div {...this.modalsWrapperProps}>
        <div {...this.modalProps}>
          <Modal.Header>
            Manage Categories
            <span style={{ float: "right" }}>
              <Icon name="close" onClick={this.onClose} />
            </span>
          </Modal.Header>
          <Modal.Content>
            <DragDropContext onDragEnd={this.onDragEnd} >
              <Droppable droppableId={this._droppableId} type="CATEGORY">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {orderedCategoryIds.map((c, i) => (
                      <FinishCategoryModalCategory
                        key={c}
                        index={i}
                        categoryId={c}
                        getDraggableStyle={this.getDraggableStyle}
                      />
                    ))}
                  {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Modal.Content>
          <Modal.Actions>
              <Button
                negative
                onClick={this.onClose}
              >Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Save'
                onClick={this.onSave}
              />
          </Modal.Actions>
        </div>
      </div>
    );
  }
}

export default connect((reduxState, props) => {
  return {
  };
}, null)(FinishCategoriesModal);
