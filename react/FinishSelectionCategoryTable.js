import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ActionCreators from './action_creators';

import './FinishSelectionCategoryTable.css';

const showdown = require("showdown");

class FinishSelectionCategoryTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    };

    this.onClickCollapse = this.onClickCollapse.bind(this);
    this.markdownConverter = new showdown.Converter();
  }

  onClickCollapse() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  renderSelectionRows() {
    const { selections } = this.props;

    return selections.map((selection, j) => {
      const selectionFields = selection["fields"];
      const options = selection["Options"] || [];
      const rowClasses = ["table-row", "selection", "white" ];

      const optionEls = options.map((option, i) => {
        const optionFields = option["fields"];
        const images = (optionFields["Image"] || []).slice(0, 2);

        return (
          <div key={option["id"]} className="finish-option">
            <div className="half">
              <p className="cell-heading">{optionFields["Name"]}</p>
              {optionFields["Unit Price"] && <p>Price: ${optionFields["Unit Price"]}</p>}
              <div
                className="notes"
                dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(optionFields["Info"]) }}
                />
            </div>
            <div className="half">
              {images.map((image) => (
                <a key={image["id"]} href={image["url"]} target="_blank">
                  <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
                </a>
              ))}
            </div>
          </div>
        );
      });

      return (
        <Draggable key={selection["id"]} draggableId={selection["id"]} index={j}>
          {(provided, snapshot) => (
            <div
              className={rowClasses.join(" ")}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              >
              <div className="table-column third">
                <p className="cell-heading">{selectionFields["Type"]}</p>
                <p className="cell-details">Location: {selectionFields["Location"]}</p>
                <p className="cell-details">Niche: {selectionFields["Room"]}</p>
                <div
                  className="notes"
                  dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(selectionFields["Notes"]) }}
                  />
              </div>
              <div className="table-column two-third options-cell">
                {optionEls}
              </div>
            </div>
          )}
        </Draggable>
      );
    });
  }

  render() {
    const { name, selections, onDragStartSelection, onDragEndSelection } = this.props;
    const { expanded } = this.state;
    const count = (selections || []).length;

    return (
      <div className="selections-category">
        <h2>
          {name}
          <span className="expand-collapse hide-print">
            <a href="#/" onClick={this.onClickCollapse}>
              {expanded ? "Collapse" : `Expand (${count} selections)` }
            </a>
          </span>
        </h2>
        {expanded &&
          <DragDropContext
            onDragEnd={onDragEndSelection}
            onDragStart={onDragStartSelection}
            >
            <Droppable droppableId={name}>
              {(provided, snapshot) => (
                <div
                  className="table"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  >
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
        }
      </div>
    )
  }
}

export default FinishSelectionCategoryTable;
