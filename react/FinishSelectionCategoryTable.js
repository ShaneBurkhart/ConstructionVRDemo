import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import AdminControls from './AdminControls';
import FinishSelection from './FinishSelection';
import FinishOptionsContainer from './FinishOptionsContainer';
import NewFinishSelectionPlaceholder from './NewFinishSelectionPlaceholder';

import './FinishSelectionCategoryTable.css';

class FinishSelectionCategoryTable extends React.Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.selections == nextProps.selections &&
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
    const { name, onClickSelection } = this.props;
    if (onClickSelection) {
      onClickSelection({
        "id": "new" + Math.random().toString(36).substring(2, 15),
        "fields": {
          "Category": name,
        }
      });
    }
  }

  onClickEditCategory = (e) => {
    const { onClickEditCategory } = this.props;
    e.stopPropagation();
    if (onClickEditCategory) onClickEditCategory();
  }

  renderSelectionRows() {
    const { name, selections, onClickSelection, onClickOption } = this.props;
    const isAdmin = this.context;

    return selections.map((selection, j) => (
      <FinishSelection
        selection={selection}
        category={name}
        index={j}
        key={selection["id"]}
        onClick={onClickSelection}
        onClickOption={onClickOption}
      />
    ));
  }

  render() {
    const { name, selections, onClickEditCategory } = this.props;
    const { expanded } = this.state;
    const isAdmin = this.context;
    const count = (selections || []).length;
    let table = null;

    if (isAdmin) {
      table = (
        <div>
          <Droppable droppableId={name} type="SELECTION">
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
          {name}
          <span className="expand-collapse hide-print">
            <a href="#/">
              {expanded ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
            </a>
          </span>

          <span style={{ float: "right" }}>
            <Button basic icon onClick={this.onClickEditCategory}>
              <Icon className="hide-print" name="edit" />
            </Button>
            <Button basic icon onClick={this.onClickEditCategory}>
              <Icon className="hide-print" name="tasks" />
            </Button>
          </span>
        </h2>
        {expanded && table}
      </div>
    )
  }
}

export default FinishSelectionCategoryTable;
