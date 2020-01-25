import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import FinishOption from './FinishOption';
import AdminControls from './AdminControls';
import FinishOptionsContainer from './FinishOptionsContainer';

import './FinishSelectionCategoryTable.css';

const showdown = require("showdown");

class FinishSelectionCategoryTable extends React.Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    };

    this.markdownConverter = new showdown.Converter();
  }

  onClickCollapse = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  renderSelectionRows() {
    const { name, selections, onClickSelection, onClickOption } = this.props;
    const isAdmin = this.context;

    return selections.map((selection, j) => {
      const selectionFields = selection["fields"];
      const options = selection["Options"] || [];
      const rowClasses = ["table-row", "selection", "white" ];

      if (isAdmin) {
        return (
          <Draggable
            key={selection["id"]}
            draggableId={selection["id"]}
            type="SELECTION"
            index={j}
            >
            {(provided, snapshot) => (
              <div
                className={rowClasses.join(" ")}
                ref={provided.innerRef}
                {...provided.draggableProps}
                onClick={() => onClickSelection(selection["id"])}
              >
                <div className="table-column third flex">
                  {isAdmin && <AdminControls
                    dragHandleProps={provided.dragHandleProps}
                  />}
                  <div className="info-cell">
                    <p className="cell-heading">{selectionFields["Type"]}</p>
                    <p className="cell-details">Location: {selectionFields["Location"]}</p>
                    <p className="cell-details">Niche: {selectionFields["Room"]}</p>
                    <div
                      className="notes"
                      dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(selectionFields["Notes"]) }}
                      />
                  </div>
                </div>
                <div className="table-column two-third options-cell">
                  <FinishOptionsContainer
                    draggable
                    droppableId={`${name}/${selection["id"]}`}
                    options={options}
                    onSelectOption={(optionId) => { if (onClickOption) onClickOption(optionId, selection["id"]) }}
                  />
                </div>
              </div>
            )}
          </Draggable>
        );
      } else {
        return (
          <div className={rowClasses.join(" ")} key={selection["id"]}>
            <div className="table-column third flex">
              <div className="info-cell">
                <p className="cell-heading">{selectionFields["Type"]}</p>
                <p className="cell-details">Location: {selectionFields["Location"]}</p>
                <p className="cell-details">Niche: {selectionFields["Room"]}</p>
                <div
                  className="notes"
                  dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(selectionFields["Notes"]) }}
                  />
              </div>
            </div>
            <div className="table-column two-third options-cell">
              <FinishOptionsContainer options={options} />
            </div>
          </div>
        );
      }
    });
  }

  render() {
    const { name, selections, onDragStartSelection, onDragEndSelection } = this.props;
    const { expanded } = this.state;
    const isAdmin = this.context;
    const count = (selections || []).length;
    let table = (
      <div className="table" >
        <div className="table-row">
          <div className="table-column third" style={{ width: "33%" }}>Selection</div>
          <div className="table-column two-third" style={{ width: "66%" }}>Options</div>
        </div>
        {this.renderSelectionRows()}
      </div>
    );

    if (isAdmin) {
      table = (
        <DragDropContext onDragEnd={onDragEndSelection} onDragStart={onDragStartSelection} >
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
        </DragDropContext>
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
        </h2>
        {expanded && table}
      </div>
    )
  }
}

export default FinishSelectionCategoryTable;
