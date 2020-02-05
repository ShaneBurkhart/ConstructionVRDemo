import React from 'react';
import * as _ from 'underscore';
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
    const { option, onClick } = this.props;
    e.stopPropagation();
    if (onClick) onClick(option);
  }

  render() {
    const { option, short, index, draggable, draggableId, getDraggableStyleOverride } = this.props;
    const optionFields = option["fields"];
    const images = (optionFields["Image"] || []).slice(0, 2);
    const classNames = ["finish-option"];
    if (short) classNames.push("short");

    if (draggable) {
      return (
        <Draggable
          draggableId={draggableId}
          type="OPTION"
          index={index}
        >
          {(provided, snapshot) => {
            let draggableStyle = provided.draggableProps["style"];

            if (getDraggableStyleOverride) {
              draggableStyle = getDraggableStyleOverride(
                draggableStyle, snapshot.isDragging
              );
            }

            return (
              <div
                className={classNames.join(" ")}
                ref={provided.innerRef}
                {...provided.draggableProps}
                style={draggableStyle}
                onClick={this.onClick}
              >
                <div className="half" style={{ display: "flex", overflow: "hidden" }}>
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
                <div className="half images">
                  {images.map((image) => (
                    <a key={image["id"]} href={image["url"]} target="_blank">
                      <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
                    </a>
                  ))}
                </div>
              </div>
            )
          }}

        </Draggable>
      );
    } else {
      return (
        <div
          className={classNames.join(" ")}
          onClick={this.onClick}
        >
          <div className="half">
            <p className="cell-heading">{optionFields["Name"]}</p>
            {!!optionFields["Unit Price"] && <p>Price: ${optionFields["Unit Price"]}</p>}
            <div
              className="notes"
              dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(optionFields["Info"]) }}
              />
          </div>
          <div className="half images">
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

