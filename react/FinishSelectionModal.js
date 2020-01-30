import React from 'react';
import * as _ from 'underscore';
import { Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import DragDropModal from './DragDropModal';
import FinishOptionsContainer from './FinishOptionsContainer';
import FinishOptionModal from './FinishOptionModal';

class FinishSelectionModal extends DragDropModal {
  constructor(props) {
    super(props);

    const selection = props.selection || {};

    this._originalCategory = (selection["fields"] || {})["Category"];

    this.state = {
      selectedOption: props.selectedOption || null,
      selectionId: selection["id"],
      selectionFields: _.clone(selection["fields"] || {}),
      options: Array.from(selection["Options"] || []),
    };
  }

  onChangeFor(attr) {
    return (e, { value }) => {
      const { selectionFields } = this.state;
      selectionFields[attr] = value;
      this.setState({ selectionFields });
    }
  }

  onSaveOption = (optionId, optionFields) => {
    const { options } = this.state;
    const newOptions = Array.from(options);
    const i = newOptions.findIndex(o => o["id"] == optionId);

    if (i == -1 && optionId.startsWith("new")) {
      newOptions.push({ "id": optionId, "fields": optionFields });
    } else {
      newOptions[i]["fields"] = _.extend(newOptions[i]["fields"], optionFields);
    }

    this.setState({ selectedOption: null, options: newOptions });
  }

  onSelectOption = (option) => {
    this.setState({ selectedOption: option });
  }

  onCloseOption = () => {
    this.setState({ selectedOption: null });
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const { options } = this.state;
    const newOptions = Array.from(options);
    if (!destination) return;

    const [removed] = newOptions.splice(source.index, 1);
    newOptions.splice(destination.index, 0, removed);

    this.setState({ options: newOptions });
  }

  onSave = () => {
    const { onSave } = this.props;
    const { selectionId, selectionFields, options } = this.state;
    onSave(this._originalCategory, {
      "id": selectionId,
      "fields": selectionFields,
      "Options": options
    });
  }

  getCategoryOptions = () => {
    const { categories } = this.props;
    const { selectionFields } = this.state;
    const categoryOptions = (categories || []).map(c => ({
      key: c, value: c, text: c,
      active: selectionFields["Category"] == c,
      selected: selectionFields["Category"] == c,
    }));
    categoryOptions.push({ text: "+ Add Category" });

    return categoryOptions;
  }

  render() {
    const { onClose } = this.props;
    const { selectionFields, options, selectedOption } = this.state;

    return (
      <div {...this.modalsWrapperProps}>
        <div {...this.modalProps}>
          <Modal.Header>
            {selectionFields["Name"] || "New Selection"}
            <span style={{ float: "right" }}>
              <Icon name="close" onClick={onClose} />
            </span>
          </Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  label="Name"
                  placeholder="PT1 - Accent Wall Paint"
                  value={selectionFields["Type"] || ""}
                  onChange={this.onChangeFor("Type")}
                />
                <Form.Select
                  fluid
                  label="Category"
                  placeholder="Concepts"
                  options={this.getCategoryOptions()}
                  value={selectionFields["Category"] || ""}
                  onChange={this.onChangeFor("Category")}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  label="Location"
                  placeholder="Clubhouse"
                  value={selectionFields["Location"] || ""}
                  onChange={this.onChangeFor("Location")}
                />
                <Form.Input
                  fluid
                  label="Niche"
                  placeholder="Coffee Bar"
                  value={selectionFields["Room"] || ""}
                  onChange={this.onChangeFor("Room")}
                />
              </Form.Group>
              <Form.TextArea
                label='Notes'
                placeholder='Add notes about this selections here...'
                value={selectionFields["Notes"] || ""}
                onChange={this.onChangeFor("Notes")}
              />
              <p>Options (click to edit, drag to reorder)</p>
              <DragDropContext onDragEnd={this.onDragEnd} >
                <FinishOptionsContainer
                  draggable
                  options={options}
                  onSelectOption={this.onSelectOption}
                  getDraggableStyleOverride={this.getDraggableStyleOverride}
                />
              </DragDropContext>
            </Form>
          </Modal.Content>
          <Modal.Actions>
              <Button
                negative
                onClick={onClose}
              >Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Save'
                onClick={this.onSave}
              />
          </Modal.Actions>
        </div>
        {selectedOption &&
          <FinishOptionModal
            isNew={selectedOption["id"].startsWith("new")}
            option={selectedOption}
            onClose={this.onCloseOption}
            onSave={this.onSaveOption}
          />
        }
      </div>
    );
  }
}

export default FinishSelectionModal;
