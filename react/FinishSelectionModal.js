import React from 'react';
import * as _ from 'underscore';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import FinishOptionsContainer from './FinishOptionsContainer';
import FinishOptionModal from './FinishOptionModal';

class FinishSelectionModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOptionId: props.selectedOptionId || null,
      selectionId: props.selection["id"],
      selectionFields: _.clone(props.selection["fields"]),
      options: Array.from(props.selection["Options"]),
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

    if (optionId.startsWith("new")) {
      newOptions.push({ "id": optionId, "fields": optionFields });
    } else {
      const i = newOptions.findIndex(o => o["id"] == optionId);
      newOptions[i]["fields"] = _.extend(newOptions[i]["fields"], optionFields);
    }

    this.setState({ selectedOptionId: null, options: newOptions });
  }

  onSelectOption = (optionId) => {
    this.setState({ selectedOptionId: optionId });
  }

  onCloseOption = () => {
    this.setState({ selectedOptionId: null });
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const { options } = this.state;
    const newOptions = Array.from(options);

    const [removed] = newOptions.splice(source.index, 1);
    newOptions.splice(destination.index, 0, removed);

    this.setState({ options: newOptions });
  }

  onSave = () => {
    const { onSave } = this.props;
    const { selectionId, selectionFields, options } = this.state;
    onSave(selectionId, selectionFields, options);
  }

  render() {
    const { onClose } = this.props;
    const { selectionFields, options, selectedOptionId } = this.state;

    return (
      <div>
        <Modal open={true}>
          <Icon name="close" onClick={onClose} />
          <Modal.Header>
            {selectionFields["Name"] || "New Selection"}
          </Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  label="Type"
                  placeholder="PT1 - Accent Wall Paint"
                  value={selectionFields["Type"]}
                  onChange={this.onChangeFor("Type")}
                />
                <Form.Input
                  fluid
                  label="Location"
                  placeholder="Clubhouse"
                  value={selectionFields["Location"]}
                  onChange={this.onChangeFor("Location")}
                />
                <Form.Input
                  fluid
                  label="Niche"
                  placeholder="Coffee Bar"
                  value={selectionFields["Room"]}
                  onChange={this.onChangeFor("Room")}
                />
              </Form.Group>
              <Form.TextArea
                label='Notes'
                placeholder='Add notes about this selections here...'
                value={selectionFields["Notes"]}
                onChange={this.onChangeFor("Notes")}
              />
              <p>Options (click to edit, drag to reorder)</p>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <FinishOptionsContainer
                  draggable
                  options={options}
                  onSelectOption={this.onSelectOption}
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
        </Modal>
        {selectedOptionId &&
          <FinishOptionModal
            isNew={selectedOptionId.startsWith("new")}
            option={options.find(o => o["id"] == selectedOptionId)}
            onClose={this.onCloseOption}
            onSave={this.onSaveOption}
          />
        }
      </div>
    );
  }
}

export default FinishSelectionModal;
