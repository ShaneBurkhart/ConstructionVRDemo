import React from 'react';
import { connect } from 'react-redux'
import { Label, Segment, Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import FinishCategoryModalCategory from './FinishCategoryModalCategory';
import ActionCreators from './action_creators';

import './FinishCategoriesDrawer.css';

class CategoriesDnD extends React.Component {
  constructor(props) {
    super(props)

    this._droppableId = Math.random().toString(36).substring(2, 15);
  }

  render() {
    const { orderedCategoryIds } = this.props;

    return (
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
              />
            ))}
          {provided.placeholder}
          </div>
        )}
      </Droppable>
    )
  }

}

class FinishCategoriesDrawer extends React.Component {
  constructor(props) {
    super(props)

    this._key = Math.random().toString(36).substring(2, 15);

    this.state = {
      newCategoryText: "",
      key: Math.random().toString(36).substring(2, 15),
    };
  }

  onChangeNewCategoryText = (e) => {
    this.setState({ newCategoryText: e.target.value });
  }

  onClickAddCategory = () => {
    const { newCategoryText } = this.state;
    if (newCategoryText.length == 0) return;

    ActionCreators.addNewCategory(newCategoryText);

    this.setState({ newCategoryText: "" });
  }

  render() {
    const { orderedCategoryIds } = this.props;
    const { newCategoryText, key } = this.state;

    return (
      <div className="categories-drawer hide-print">
        <Segment vertical>
          <img src="/logo.png" />
        </Segment>
        <Segment vertical>
          <label>Add A Category</label>
          <Input
            fluid
            size="mini"
            placeholder="Flooring"
            value={newCategoryText}
            action={{
              color: 'green',
              icon: 'plus',
              onClick: this.onClickAddCategory,
            }}
            onChange={this.onChangeNewCategoryText}
          />
        </Segment>
        <Segment vertical className="categories-section">
          <label>Click to Jump to Category</label>

          <Segment vertical>
            <CategoriesDnD
              key={orderedCategoryIds.reduce((m, id) => m + id, "")}
              orderedCategoryIds={orderedCategoryIds}
            />
          </Segment>
        </Segment>
      </div>
    );
  }
}

export default connect((reduxState, props) => {
  return {
  };
}, null)(FinishCategoriesDrawer);
