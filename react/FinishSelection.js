import React from 'react';
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import AdminContext from './context/AdminContext';

import FinishOptionsContainer from './FinishOptionsContainer';
import AdminControls from './AdminControls';

import "./FinishSelection.css"

const showdown = require("showdown");

class FinishSelection extends React.Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);

    this.markdownConverter = new showdown.Converter();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.selection == nextProps.selection &&
        this.props.index == nextProps.index) {
      return false;
    }
    return true;
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  onClickOption = (option) => {
    const { selection, onClickOption } = this.props;
    if (onClickOption) onClickOption(option, selection);
  }

  onClickLinkOption = () => {
    const { selection, onClickLinkOption } = this.props;
    if (onClickLinkOption) onClickLinkOption(selection);
  }

  onClickUnlinkOption = (option) => {
    const { selection, onClickUnlinkOption } = this.props;
    const newSelection = _.clone(selection);

    newSelection["Options"] = (newSelection["Options"] || [])
      .filter(o => o["id"] != option["id"]);
    if (onClickUnlinkOption) onClickUnlinkOption(newSelection);
  }

  onClickTrashSelection = () => {
    const { selection, onClickTrashSelection } = this.props;
    if (onClickTrashSelection) onClickTrashSelection(selection);
  }

  render() {
    const { selection, index, categoryId, onClick } = this.props;
    const isAdmin = this.context;

    const selectionFields = selection["fields"];
    const options = selection["Options"] || [];
    const rowClasses = ["table-row", "selection", "white" ];

    if (isAdmin) {
      return (
        <Draggable
          draggableId={selection["id"]}
          type="SELECTION"
          index={index}
          >
          {(provided, snapshot) => (
            <div
              className={rowClasses.join(" ")}
              ref={provided.innerRef}
              {...provided.draggableProps}
              onClick={_ => onClick(selection)}
            >
              <div className="table-column third flex">
                <AdminControls
                  dragHandleProps={provided.dragHandleProps}
                  onClickTrash={this.onClickTrashSelection}
                />
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
                  droppableId={`${categoryId}/${selection["id"]}`}
                  options={options}
                  onSelectOption={this.onClickOption}
                  onLinkOption={this.onClickLinkOption}
                  onUnlinkOption={this.onClickUnlinkOption}
                />
              </div>
            </div>
          )}
        </Draggable>
      );
    } else {
      return (
        <div className={rowClasses.join(" ")}>
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
  }
}

export default FinishSelection;
