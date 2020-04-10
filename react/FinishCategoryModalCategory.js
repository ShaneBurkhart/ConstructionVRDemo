import React from 'react';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'

import AdminControls from './AdminControls';

class FinishCategoryModalCategory extends React.Component {
  render() {
    const { index, categoryId, category, shownSelectionCount } = this.props;

    return (
      <Draggable
        key={categoryId}
        draggableId={categoryId + ""}
        type="CATEGORY"
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div style={{ display: "flex" }}>
              <AdminControls
                dragHandleProps={provided.dragHandleProps}
              />
              <div style={{ width: "100%" }}>
                <p>
                  <a href={`#${categoryId}`}>{category.name} ({shownSelectionCount})</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}

export default connect((reduxState, props) => {
  return {
    category: reduxState.categories[props.categoryId],
    shownSelectionCount: (reduxState.filteredOrderedSelectionIdsByCategoryId[props.categoryId] || []).length,
  };
}, null)(FinishCategoryModalCategory);
