import React from 'react';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import AdminControls from './AdminControls';
import FinishSelection from './FinishSelection';
import FinishOptionsContainer from './FinishOptionsContainer';
import NewFinishSelectionPlaceholder from './NewFinishSelectionPlaceholder';
import FocusEditableInput from './FocusEditableInput';

import './FinishSelectionCategoryTable.css';

class FinishSelectionCategoryTable extends React.Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props)

    this.state = { expanded: true };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.category == nextProps.category &&
        this.props.category["fields"]["Selections"] == nextProps.category["fields"]["Selections"] &&
        this.state.expanded == nextState.expanded) {
      return false;
    }

    return true;
  }

  onClickCollapse = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  onNewSelection = () => {
    const { category, onClickSelection } = this.props;
    if (onClickSelection) {
      onClickSelection({
        "id": "new" + Math.random().toString(36).substring(2, 15),
        "fields": {
          "Category": [category.id],
        }
      });
    }
  }

  onClickTrashSelection = (selection) => {
    const { category, onTrashSelection } = this.props;

    if (onTrashSelection) {
      category["Selections"] = Array.from(category["Selections"])
        .filter(s => s["id"] != selection["id"]);
      onTrashSelection(category);
    }
  }

  onChangeCategoryName = (name) => {
    const { category, onSaveCategory } = this.props;

    if (onSaveCategory) {
      const newCategory = _.clone(category);
      const newFields = _.clone(category["fields"]);

      newFields["Name"] = name;
      newCategory["fields"] = newFields;

      onSaveCategory(newCategory);
    }
  }

  renderSelectionRows() {
    const { category, orderedSelectionIds, onClickSelection, onClickOption,
      onClickLinkOption, onUnlinkOption, onClickTrashSelection,
      onSaveSelection } = this.props;
    const isAdmin = this.context;

    return orderedSelectionIds.map((selectionId, j) => (
      <FinishSelection
        selectionId={selectionId}
        categoryId={category.id}
        index={j}
        key={selectionId}
        onClick={onClickSelection}
        onClickOption={onClickOption}
        onClickLinkOption={onClickLinkOption}
        onClickUnlinkOption={onUnlinkOption}
        onClickTrashSelection={this.onClickTrashSelection}
        onSaveSelection={onSaveSelection}
      />
    ));
  }

  render() {
    const { category, onClickEditCategory } = this.props;
    const { expanded } = this.state;
    const isAdmin = this.context;
    const count = (category["fields"]["Selections"] || []).length;
    let table = null;

    if (isAdmin) {
      table = (
        <div>
          <Droppable droppableId={category.id} type="SELECTION">
            {(provided, snapshot) => (
              <div className="table" ref={provided.innerRef} {...provided.droppableProps} >
                <div className="table-row">
                  <div className="table-column third" style={{ width: "33%" }}>Selection</div>
                  <div className="table-column two-third" style={{ width: "66%" }}>Options</div>
                </div>
                {this.renderSelectionRows()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <NewFinishSelectionPlaceholder onClick={this.onNewSelection}/>
        </div>
      );
    } else {
      table = (
        <div className="table" >
          <div className="table-row">
            <div className="table-column third" style={{ width: "33%" }}>Selection</div>
            <div className="table-column two-third" style={{ width: "66%" }}>Options</div>
          </div>
          {this.renderSelectionRows()}
        </div>
      );
    }

    return (
      <div className="selections-category">
        <h2 onClick={this.onClickCollapse}>
          <Icon className="hide-print" name={expanded ? "angle down" : "angle up"} />
          <FocusEditableInput value={category.fields["Name"]} onChange={this.onChangeCategoryName} />
          <span className="expand-collapse hide-print">
            <a href="#/">
              {expanded ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
            </a>
          </span>
        </h2>
        {expanded && table}
      </div>
    )
  }
}

export default connect(
  (reduxState, props) => {
    const categoryId = props.categoryId;
    const category = reduxState.categories[categoryId];
    const orderedSelectionIds = reduxState.filteredOrderedSelectionIdsByCategoryId[categoryId];

    return { category, orderedSelectionIds };
  },
  null
)(FinishSelectionCategoryTable);
