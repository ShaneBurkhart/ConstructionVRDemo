import React from 'react';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Popup, Button, Icon } from 'semantic-ui-react'

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
        (this.props.category["fields"]["Selections"] || []).length == (nextProps.category["fields"]["Selections"] || []).length &&
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
    const { category, filter } = this.props;
    ActionCreators.addNewSelection(category["id"], { "Location": filter });
  }

  onRemoveSelection = (selection) => {
    ActionCreators.removeSelection(selection["id"]);
  }

  onRemoveCategory = (selection) => {
    const { category } = this.props;
    ActionCreators.removeCategory(category["id"]);
  }

  onChangeCategoryName = (name) => {
    const { category } = this.props;
    ActionCreators.updateCategory(category["id"], { "Name": name });
  }

  onClickReorderCategories = _ => {
    this.props.dispatch(ActionCreators.updateModal({
      reorderCategories: true,
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
    const { category, orderedSelectionIds } = this.props;
    const { expanded } = this.state;
    const isAdmin = this.context;
    const count = (orderedSelectionIds || []).length;
    let table = null;

    if (category["DELETE"]) return "";

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
      <div
        id={category["id"]}
        className={["selections-category", count == 0 ? "no-print" : ""].join(" ")}
      >
        <header>
          <h2 onClick={this.onClickCollapse}>
            <Icon className="hide-print" name={expanded ? "angle down" : "angle up"} />
            <FocusEditableInput
              editable={isAdmin}
              value={category.fields["Name"]}
              onChange={this.onChangeCategoryName}
            />
            <span className="expand-collapse hide-print">
              <a href="#/">
                {expanded ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
              </a>
            </span>

          </h2>
          {isAdmin && <h2 className="hide-print" style={{ width: 200, textAlign: "right" }}>
            <Popup
              on="click"
              content={
                <div>
                  <p className="bold">Are you sure?</p>
                  <Button color="red" onClick={this.onRemoveCategory}>Delete</Button>
                </div>
              }
              trigger={<Button icon="trash" />}
            />
          </h2>}
        </header>
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
    const filter = reduxState.filter;

    return { category, orderedSelectionIds, filter };
  },
  null
)(FinishSelectionCategoryTable);
