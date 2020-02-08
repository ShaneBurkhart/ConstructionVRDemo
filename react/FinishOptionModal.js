import React from 'react';
import * as _ from 'underscore';
import { Grid, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import StyledDropzone from "./StyledDropzone"
import FocusEditableInput from './FocusEditableInput';

import "./FinishOptionModal.css"

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

  onDrop = (acceptedFiles) => {
    const { optionFields } = this.state;
    if (optionFields["Image"].length >= 2) return;

    (acceptedFiles || []).forEach(file => {
      console.log(file);
      ActionCreators.presignedURL(file, (data) => {
        ActionCreators.uploadFile(file, data.presignedURL, () => {
          const newFields = _.clone(this.state.optionFields);
          const newImages = Array.from(newFields["Image"]);

          newImages.push({ url: data.awsURL });
          newFields["Image"] = newImages;

          this.setState({ optionFields: newFields });
        });
      });
    });
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
      <Modal open={true} className="finish-option-modal">
        <Modal.Content>
          <div style={{ textAlign: "right" }}>
            <Icon name="close" onClick={onClose} />
          </div>
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Name"
                placeholder='CANARM 7" Disc Light LED - White'
                value={optionFields["Name"] || ""}
                onChange={this.onChangeFor("Name")}
              />
            </Form.Group>

            <div className="field">
              <label>Images</label>
              <Grid>
                <Grid.Row>
                  {images.map((image) => (
                    <Grid.Column width={8} key={image["id"] || image["url"]}>
                      <Image src={image["url"]} />
                    </Grid.Column>
                  ))}
                  {images.length < 2 &&
                    <Grid.Column width={8}>
                      <StyledDropzone onDrop={this.onDrop} />
                      <div className="image-placeholder">
                        <Icon name="linkify" />
                        Upload with URL
                      </div>
                    </Grid.Column>
                  }
                </Grid.Row>
              </Grid>
            </div>
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

