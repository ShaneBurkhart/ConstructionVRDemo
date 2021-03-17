import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Draggable } from 'react-beautiful-dnd';

// import AdminControls from './AdminControls';

const FinishCategoryModalCategory = ({ index, category }) => {
  const shownSelectionCount = 'get # TO DO'
  return (
    <Draggable
      key={category}
      draggableId={category}
      type="CATEGORY"
      index={index}
      >
      {(provided, snapshot) => (
        <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        >
          <div style={{ display: "flex" }}>
            <div {...provided.dragHandleProps}>
              <Icon name="arrows alternate" />
            </div>
            {/* <AdminControls
              dragHandleProps={provided.dragHandleProps}
            /> */}
            <div style={{ width: "100%" }}>
              <p>
                <a href={`#${category}`}>{category} ({shownSelectionCount})</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default FinishCategoryModalCategory;
