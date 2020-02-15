import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import ActionCreators from './action_creators';
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
        this.props.orderedOptionIds == nextProps.orderedOptionIds &&
        this.props.index == nextProps.index) {
      return false;
    }
    return true;
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  onClickLinkOption = () => {
    const { selectionId } = this.props;
    this.props.dispatch(ActionCreators.updateModal({ linkSelectionId: selectionId }));
  }

  onUnlinkOption = (optionId) => {
    const { selection } = this.props;

    selection["fields"]["Options"] = (selection["fields"]["Options"] || [])
      .filter(o => o != optionId);
    this.props.dispatch(ActionCreators.updateEach({ selections: [selection] }));
  }

  onClickTrashSelection = () => {
    const { selection, onClickTrashSelection } = this.props;
    if (onClickTrashSelection) onClickTrashSelection(selection);
  }

  onClickNewOption = () => {
    const { selectionId } = this.props;
    this.props.dispatch(ActionCreators.updateModal({ optionId: "new", selectionId }));
  }

  onChangeFor(attr) {
    const { selection } = this.props;
    return val => {
      selection["fields"][attr] = val;
      this.props.dispatch(ActionCreators.updateEach({ selections: [selection] }));
    }
  }

  renderSelectionDetails() {
    const { selection } = this.props;
    const selectionFields = selection["fields"];
    const isAdmin = this.context;

    return (
      <div className="info-cell" style={{ width: "100%" }}>
        <div className="cell-heading">
          <FocusEditableInput
            editable={isAdmin}
            value={selectionFields["Type"]}
            onChange={this.onChangeFor("Type")}
          />
        </div>
        <div className="cell-details">
          <span>Location: </span>
          <FocusEditableInput
            editable={isAdmin}
            value={selectionFields["Location"]}
            onChange={this.onChangeFor("Location")}
          />
        </div>
        <div className="cell-details">
          <span>Niche: </span>
          <FocusEditableInput
            editable={isAdmin}
            value={selectionFields["Room"]}
            onChange={this.onChangeFor("Room")}
          />
        </div>
        <FocusEditableTextarea
          editable={isAdmin}
          className="notes"
          unfocusedValue={this.getMarkdownHTML(selectionFields["Notes"])}
          value={selectionFields["Notes"]}
          onChange={this.onChangeFor("Notes")}
        />
      </div>
    );
  }

  render() {
    const { selection, orderedOptionIds, index, onClick } = this.props;
    const isAdmin = this.context;

    const selectionFields = selection["fields"];
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
                  droppableId={`${selection["fields"]["Category"][0]}/${selection["id"]}`}
                  orderedOptionIds={orderedOptionIds}
                  onNewOption={this.onClickNewOption}
                  onLinkOption={this.onClickLinkOption}
                  onUnlinkOption={this.onUnlinkOption}
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
            <FinishOptionsContainer orderedOptionIds={orderedOptionIds} />
          </div>
        </div>
      );
    }
  }
}

export default connect(
  (reduxState, props) => {
    const { selectionId } = props;
    return {
      selection: reduxState.selections[selectionId],
      orderedOptionIds: reduxState.orderedOptionIdsBySelectionId[selectionId]
    }
  },
  null
)(FinishSelection);
