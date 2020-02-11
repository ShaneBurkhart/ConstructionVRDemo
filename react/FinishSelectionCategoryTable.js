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
        this.props.orderedSelectionIds == nextProps.orderedSelectionIds &&
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
    const { category } = this.props;
    const newSelections = (category["fields"]["Selections"] || []);
    const newSelection = {
      "id": "new" + Math.random().toString(36).substring(2, 15),
      "fields": {
        "Type": "New Selection",
        "Location": "Amenities",
        "Room": "Study Lounge",
        "Category": [ category["id"] ],
        "Order": newSelections.length,
      }
    }

    newSelections.push(newSelection["id"]);

    this.props.dispatch(ActionCreators.updateEach({
      selections: [ newSelection ],
      categories: [{
        "id": category["id"],
        "fields": {
          ...category["fields"],
          "Selections": newSelections,
        },
      }]
    }));
  }

  onRemoveSelection = (selection) => {
    const { category } = this.props;
    const newSelections = category["fields"]["Selections"]
        .filter(s => s != selection["id"]);

    this.props.dispatch(ActionCreators.updateEach({
      categories: [{
        "id": category["id"],
        "fields": {
          ...category["fields"],
          "Selections": newSelections,
        },
      }]
    }));
  }

  onChangeCategoryName = (name) => {
    const { category } = this.props;

    this.props.dispatch(ActionCreators.updateEach({
      categories: [{
        "id": category["id"],
        "fields": { ...category["fields"], "Name": name },
      }]
    }));
  }

  renderSelectionRows() {
    const { category, orderedSelectionIds } = this.props;
    const isAdmin = this.context;

    return orderedSelectionIds.map((selectionId, j) => (
      <FinishSelection
        selectionId={selectionId}
        index={j}
        key={selectionId}
        onClickTrashSelection={this.onRemoveSelection}
      />
    ));
  }

  render() {
    const { category } = this.props;
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
