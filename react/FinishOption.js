import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ActionCreators from './action_creators';
import AdminControls from './AdminControls';

import './FinishOption.css';

const showdown = require("showdown");

class FinishOption extends React.Component {
  constructor(props) {
    super(props);

    this.markdownConverter = new showdown.Converter();
    this.state = { showDetails: false };
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  onClick = (e) => {
    const { option } = this.props;
    e.stopPropagation();

    this.props.dispatch(ActionCreators.updateModal({
      optionId: option["id"],
      selectionId: option.SelectionId,
    }));
  }

  onClickUnlink = (e) => {
    const { optionId, onClickUnlink } = this.props;
    e.stopPropagation();
    if (onClickUnlink) onClickUnlink(optionId);
  }

  onToggleShowDetails = (e) => {
    e.stopPropagation();
    const { showDetails } = this.state;
    this.setState({ showDetails: !showDetails });
  }

  render() {
    const { option, optionId, short, index, draggable, draggableId, getDraggableStyleOverride } = this.props;
    const { showDetails } = this.state;
    const images = (option.Images || []).slice(0, 2);
    const classNames = ["finish-option"];
    const isNewOption = optionId == "new";
    if (short) classNames.push("short");

    if (draggable) {
      return (
        <Draggable
          draggableId={draggableId}
          type="OPTION"
          index={index}
          isDragDisabled={isNewOption}
        >
          {(provided, snapshot) => {
            let draggableStyle = provided.draggableProps["style"];
            const newStyle = { backgroundColor: "#e0e0e0", cursor: "not-allowed" };

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
                style={{ ...draggableStyle, ...(isNewOption ? newStyle : {}) }}
                onClick={isNewOption ? null : this.onClick}
              >
                <div className="half" style={{ display: "flex", overflow: "hidden", wordBreak: "break-word" }}>
                  <AdminControls
                    dragHandleProps={provided.dragHandleProps}
                    onClickTrash={isNewOption ? null : this.onClickUnlink}
                  />
                  <div>
                    <p className="cell-heading">{option.name}</p>
                    {(option.manufacturer || option.itemNum || option.unitPrice || option.style || option.size || option.url) &&
                      <div className="option-details">
                        <div className="show-print" style={{ display: showDetails ? "block" : "none" }}>
                          {option.manufacturer && <p><span className="bold">Manufacturer: </span>{option.manufacturer}</p>}
                          {option.itemNum && <p><span className="bold">Item #: </span>{option.itemNum}</p>}
                          {option.unitPrice && <p><span className="bold">Unit Price: </span>${option.unitPrice}</p>}
                          {option.style && <p><span className="bold">Style/Color: </span>{option.style}</p>}
                          {option.size && <p><span className="bold">Size: </span>{option.size}</p>}
                          {option.url && <p className="hide-print"><span className="bold">
                              Product Website: </span><a href={option.url} target="_blank" onClick={e=>e.stopPropagation()}>Link</a>
                          </p>}
                        </div>
                        <p className="hide-print"><a onClick={this.onToggleShowDetails}>{showDetails ? "Hide details" : "Show details"}</a></p>
                      </div>
                    }
                    {option.info &&
                      <div>
                        <div
                          className="notes"
                          dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(option.info) }}
                          />
                      </div>
                    }
                  </div>
                </div>
                <div className="half images">
                  {images.map((image) => (
                    <a key={image.id || image.url} href={image.url} target="_blank" onClick={e=>e.stopPropagation()}>
                      <img className={images.length == 1 ? "one" : "two"} src={image.url} />
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
            <p className="cell-heading">{option.name}</p>
            {!!option.unitPrice && <p>Price: ${option.unitPrice}</p>}
            <div
              className="notes"
              dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(option.info) }}
              />
          </div>
          <div className="half images">
            {images.map((image) => (
              <a key={image.id} href={image.url} target="_blank">
                <img className={images.length == 1 ? "one" : "two"} src={image.url} />
              </a>
            ))}
          </div>
        </div>
      );
    }
  }
}

export default connect(
  (reduxState, props) => {
    return {
      option: reduxState.options[props.optionId]
    }
  },
  null
)(FinishOption);

