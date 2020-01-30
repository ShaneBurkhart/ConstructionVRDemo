import React from 'react';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import './FinishAdminSection.css';

class FinishAdminSection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onClickManageCategories } = this.props;

    return (
      <div>
        <Button
          color="blue"
          onClick={onClickManageCategories}
        >Manage Categories</Button>
      </div>
    );
  }
}

export default FinishAdminSection;


