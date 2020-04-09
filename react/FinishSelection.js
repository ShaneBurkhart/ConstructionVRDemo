import React, { createRef } from 'react';
import { connect } from 'react-redux'
import * as _ from 'underscore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Segment, Input, Label, Icon, Button, Popup, Checkbox, Dropdown } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import AdminContext from './context/AdminContext';

import AddSelectionLocationPopup from './AddSelectionLocationButtonPopup';
import FinishOptionsContainer from './FinishOptionsContainer';
import AdminControls from './AdminControls';
import FocusEditableInput from './FocusEditableInput';

import "./FinishSelection.css"

const showdown = require("showdown");

class FinishSelection extends React.Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);

    this.markdownConverter = new showdown.Converter();
  }

  shouldComponentUpdate(nextProps) {
    if (_.isEqual(this.props.selection, nextProps.selection) &&
        _.isEqual(this.props.orderedOptionIds, nextProps.orderedOptionIds) &&
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
    const newOptions = (selection.Options || []).filter(o => o != optionId);

    ActionCreators.removeOption(optionId);
  }

  onAddLocation = (name) => {
    const { selection } = this.props;
    const newLocations = [ ...selection.SelectionLocations ];

    newLocations.push({
      location: name,
      SelectionId: selection.id,
      ProjectId: selection.ProjectId
    });

    this.onChangeFor("SelectionLocations")(newLocations);
  }

  onRemoveLocation = (name) => {
    const { selection } = this.props;
    const newLocations = [ ...selection.SelectionLocations ].filter(sl => (
      sl.location != name
    ));

    this.onChangeFor("SelectionLocations")(newLocations);
  }

  onMoveToCategory = (category) => {
    const { selection } = this.props;
    ActionCreators.moveSelection(selection.id, category.id, 0);
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
      ActionCreators.updateSelection(selection["id"], { [attr]: val });
    }
  }

  renderSelectionDetails() {
    const { selection, selectionFilters } = this.props;
    const isAdmin = this.context;

    return (
      <div className="info-cell" style={{ width: "100%" }}>
        <div className="cell-heading">
          <FocusEditableInput
            editable={isAdmin}
            value={selection.type}
            onChange={this.onChangeFor("type")}
          />
        </div>
        <div className="cell-details">
          <p>Locations:</p>
          {(selection.SelectionLocations || []).sort((a, b) => (
            a.location.localeCompare(b.location)
          )).map(sl => (
            <div
              key={sl.id || Math.random().toString(36).substring(2, 15)}
              style={{ marginBottom: 3 }}
            >
              <Label basic size="tiny">
                {sl.location}
                <Icon className="hide-print" name="close" onClick={_=>this.onRemoveLocation(sl.location)} />
              </Label>
            </div>
          ))}
          <AddSelectionLocationPopup
            selection={selection}
            locations={selectionFilters.locations}
            onAddLocation={this.onAddLocation}
          />
        </div>
      </div>
    );
  }

  render() {
    const { selection, orderedOptionIds, index, onClick } = this.props;
    const isAdmin = this.context;

    const rowClasses = ["table-row", "selection", "white" ];

    if (isAdmin) {
      return (
        <Draggable
          draggableId={selection.id + ""}
          type="SELECTION"
          index={index}
          >
          {(provided, snapshot) => {
            if (snapshot.isDragging) {
              return (
                <div
                  className={rowClasses.join(" ")}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{ ...provided.draggableProps.style, width: 200, maxHeight: 200, overflow: "hidden" }}
                >
                  <div className="table-column flex">
                    {this.renderSelectionDetails()}
                  </div>
                </div>
              );
            }
            return (
              <div
                className={rowClasses.join(" ")}
                ref={provided.innerRef}
                {...provided.draggableProps}
              >
                <div className="table-column third flex">
                  <AdminControls
                    dragHandleProps={provided.dragHandleProps}
                    onClickTrash={this.onClickTrashSelection}
                    onMoveToCategory={this.onMoveToCategory}
                  />
                  {this.renderSelectionDetails()}
                </div>
                <div className="table-column two-third options-cell">
                  <FinishOptionsContainer
                    draggable
                    droppableId={`${selection.CategoryId}/${selection.id}`}
                    orderedOptionIds={orderedOptionIds}
                    onNewOption={this.onClickNewOption}
                    onLinkOption={this.onClickLinkOption}
                    onUnlinkOption={this.onUnlinkOption}
                  />
                </div>
              </div>
            )
          }}
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
      orderedOptionIds: reduxState.orderedOptionIdsBySelectionId[selectionId],
      selectionFilters: reduxState.selectionFilters,
    }
  },
  null
)(FinishSelection);
