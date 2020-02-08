import React from 'react';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'

import AdminControls from './AdminControls';

class FinishCategoryModalCategory extends React.Component {
  render() {
    const { index, categoryId, category, getDraggableStyle } = this.props;

    return (
      <Draggable
        key={categoryId}
        draggableId={categoryId}
        type="CATEGORY"
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={getDraggableStyle(
              provided.draggableProps["style"],
              snapshot.isDragging
            )}
          >
            <div style={{ display: "flex" }}>
              <AdminControls
                dragHandleProps={provided.dragHandleProps}
              />
              <div style={{ width: "100%" }}>
                <p>{category.fields["Name"]}</p>
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
  };
}, null)(FinishCategoryModalCategory);
