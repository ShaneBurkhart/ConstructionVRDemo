import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import AdminControls from './AdminControls';

import './FinishOption.css';

const showdown = require("showdown");

class FinishOption extends React.Component {
  constructor(props) {
    super(props);

    this.markdownConverter = new showdown.Converter();
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  onClick = (e) => {
    const { onClick } = this.props;
    e.stopPropagation();
    if (onClick) onClick();
  }

  render() {
    const { option, index, draggable } = this.props;
    const optionFields = option["fields"];
    const images = (optionFields["Image"] || []).slice(0, 2);

    if (draggable) {
      return (
        <Draggable
          draggableId={option["id"]}
          type="OPTION"
          index={index}
        >
          {(provided, snapshot) => (
            <div
              className="finish-option"
              ref={provided.innerRef}
              {...provided.draggableProps}
              onClick={this.onClick}
            >
              <div className="half" style={{ display: "flex" }}>
                <AdminControls
                  dragHandleProps={provided.dragHandleProps}
                />
                <div>
                  <p className="cell-heading">{optionFields["Name"]}</p>
                  {optionFields["Unit Price"] && <p>Price: ${optionFields["Unit Price"]}</p>}
                  <div
                    className="notes"
                    dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(optionFields["Info"]) }}
                    />
                </div>
              </div>
              <div className="half">
                {images.map((image) => (
                  <a key={image["id"]} href={image["url"]} target="_blank">
                    <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Draggable>
      );
    } else {
      return (
        <div
          className="finish-option"
          onClick={this.onClick}
        >
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
    }
  }
}

export default FinishOption;

