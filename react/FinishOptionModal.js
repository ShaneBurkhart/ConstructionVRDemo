import React from 'react';
import * as _ from 'underscore';
import { Grid, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import StyledDropzone from "./StyledDropzone"

class FinishOptionModal extends React.Component {
  constructor(props) {
    super(props);

    const option = props.option || {};
    const newId = "new" + Math.random().toString(36).substring(2, 15);

    this.state = {
      optionId: option["id"] || newId,
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
    const images = optionFields["Image"] || [];

    return (
      <Modal open={true}>
        <Icon name="close" onClick={onClose} />
        <Modal.Header>
          {optionFields["Name"] || "New Option"}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Grid>
              <Grid.Row>
                {images.map((image) => (
                  <Grid.Column width={8}>
                    <Image key={image["id"]} src={image["url"]} />
                  </Grid.Column>
                ))}
                {images.length < 2 &&
                  <Grid.Column width={8}>
                    <StyledDropzone onDrop={acceptedFiles => console.log(acceptedFiles)} />
                  </Grid.Column>
                }
              </Grid.Row>
            </Grid>
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

