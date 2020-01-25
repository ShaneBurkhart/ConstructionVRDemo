import React from 'react';
import * as _ from 'underscore';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

class FinishOptionModal extends React.Component {
  constructor(props) {
    super(props);

    const option = props.option || {};

    this.state = {
      optionId: option["id"] || "new",
      optionFields: _.clone(option["fields"] || {}),
    };
  }

  onChangeFor(attr) {
    return (e, { value }) => {
      const { optionFields } = this.state;
      optionFields[attr] = value;
      this.setState({ optionFields });
    }
  }

  onSave = () => {
    const { onSave } = this.props;
    const { optionId, optionFields } = this.state;
    onSave(optionId, optionFields);
  }

  render() {
    const { onClose } = this.props;
    const { optionFields } = this.state;

    return (
      <Modal open={true}>
        <Icon name="close" onClick={onClose} />
        <Modal.Header>
          {optionFields["Name"] || "New Option"}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Name"
                placeholder='CANARM 7" Disc Light LED - White'
                value={optionFields["Name"] || ""}
                onChange={this.onChangeFor("Name")}
              />
              <Form.Input
                fluid
                label="Category"
                placeholder="Light Fixtures"
                value={optionFields["Category"] || ""}
                onChange={this.onChangeFor("Category")}
              />
            </Form.Group>
            <Form.Input
              label="URL"
              placeholder="http://...."
              value={optionFields["URL"] || ""}
              onChange={this.onChangeFor("URL")}
            />
            <Form.TextArea
              label='Notes'
              placeholder='Add notes about this option...'
              value={optionFields["Info"] || ""}
              onChange={this.onChangeFor("Info")}
            />
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
    );
  }
}

export default FinishOptionModal;

