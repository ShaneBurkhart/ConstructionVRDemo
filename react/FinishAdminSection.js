import React from 'react';
import { connect } from 'react-redux'
import { Input, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ActionCreators from './action_creators';
import './FinishAdminSection.css';

class FinishAdminSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newCategoryText: "",
    };
  }

  onChangeNewCategoryText = (e) => {
    this.setState({ newCategoryText: e.target.value });
  }

  onClickAddCategory = () => {
    const { categories } = this.props;
    const { newCategoryText } = this.state;
    if (newCategoryText.length == 0) return;

    const newId = "new" + Math.random().toString(36).substring(2, 15);
    const updates = [{ "id": newId, "fields": {
      "Name": newCategoryText,
      "Order": 0,
    }}];

    Object.values(categories || {}).forEach(c => {
      c["fields"]["Order"] += 1;
      updates.push(c);
    });

    this.props.dispatch(ActionCreators.updateEach({ "categories": updates }));
    this.setState({ newCategoryText: "" });
  }

  render() {
    const { onClickManageCategories } = this.props;
    const { newCategoryText } = this.state;

    return (
      <div className="admin-section hide-print">
        <div className="xlarge-container">
          <div style={{ marginBottom: 15 }}>
            <Button
              color="blue"
              onClick={onClickManageCategories}
            >Reorder Categories</Button>
          </div>
          <div style={{ marginBottom: 15 }}>
            <Input
              value={newCategoryText}
              onChange={this.onChangeNewCategoryText}
              label="New Category"
              action={{
                color: "green",
                icon: "circle plus",
                content: "Add to Bottom",
                onClick: this.onClickAddCategory,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((reduxState, props) => {
  return {
    categories: reduxState.categories,
  };
}, null)(FinishAdminSection);


