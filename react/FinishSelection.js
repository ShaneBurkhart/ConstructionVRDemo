import React from 'react';
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import AdminContext from './context/AdminContext';

import FinishOptionsContainer from './FinishOptionsContainer';
import AdminControls from './AdminControls';
import FocusEditableInput from './FocusEditableInput';
import FocusEditableTextarea from './FocusEditableTextarea';

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

  onChangeFor(attr) {
    const { selection, onSaveSelection } = this.props;
    return val => {
      if (onSaveSelection) {
        const newSelection = _.clone(selection);
        const newFields = _.clone(selection["fields"]);
        newFields[attr] = val;
        newSelection["fields"] = newFields;
        onSaveSelection(newFields["Category"][0], newSelection);
      }
    }
  }

  renderSelectionDetails() {
    const { selection } = this.props;
    const selectionFields = selection["fields"];

    return (
      <div className="info-cell" style={{ width: "100%" }}>
        <div className="cell-heading">
          <FocusEditableInput
            value={selectionFields["Type"]}
            onChange={this.onChangeFor("Type")}
          />
        </div>
        <div className="cell-details">
          <span>Location: </span>
          <FocusEditableInput
            value={selectionFields["Location"]}
            onChange={this.onChangeFor("Location")}
          />
        </div>
        <div className="cell-details">
          <span>Niche: </span>
          <FocusEditableInput
            value={selectionFields["Room"]}
            onChange={this.onChangeFor("Room")}
          />
        </div>
        <FocusEditableTextarea
          className="notes"
          unfocusedValue={this.getMarkdownHTML(selectionFields["Notes"])}
          value={selectionFields["Notes"]}
          onChange={this.onChangeFor("Notes")}
        />
      </div>
    );
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
              //onClick={_ => onClick(selection)}
            >
              <div className="table-column third flex">
                <AdminControls
                  dragHandleProps={provided.dragHandleProps}
                  onClickTrash={this.onClickTrashSelection}
                />
                {this.renderSelectionDetails()}
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
            {this.renderSelectionDetails()}
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
