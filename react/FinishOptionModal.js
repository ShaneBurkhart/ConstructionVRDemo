import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { Popup, Input, Grid, Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';
import StyledDropzone from "./StyledDropzone"
import FocusEditableInput from './FocusEditableInput';

import "./FinishOptionModal.css"

class FinishOptionModal extends React.Component {
  constructor(props) {
    super(props);

    const option = props.option || {};
    const newId = "new" + Math.random().toString(36).substring(2, 15);

    this.isNew = (props.optionId || "").startsWith("new");

    this.state = {
      optionId: this.isNew ? newId : option["id"],
      optionFields: option || {},
      linkUpload: "",
    };
  }

  onClickLinkUpload = () => {
    const { linkUpload } = this.state;
    const imgMatch = linkUpload.match(/^(https?:\/\/)?([a-zA-Z0-9_\-]+\.)?[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\/([a-zA-Z0-9_\-\/]+)?\.(jpg|jpeg|png|gif)(\?.*)$/g);

    if (imgMatch) {
      const newFields = _.clone(this.state.optionFields);
      const newImages = Array.from(newFields.Images || []);

      newImages.push({ url: linkUpload });
      newFields.Images = newImages;

      this.setState({ optionFields: newFields, linkUpload: "" });
    }
  }

  onChangeLink = (e) => {
    this.setState({ linkUpload: e.target.value });
  }

  onDrop = (acceptedFiles) => {
    const { optionFields } = this.state;
    if ((optionFields.Images || []).length >= 2) return;

    (acceptedFiles || []).forEach(file => {
      ActionCreators.presignedURL(file, (data) => {
        ActionCreators.uploadFile(file, data.presignedURL, () => {
          const newFields = _.clone(this.state.optionFields);
          const newImages = Array.from(newFields.Images || []);

          newImages.push({ url: data.awsURL });
          newFields.Images = newImages;

          this.setState({ optionFields: newFields });
        });
      });
    });
  }

  removeImage = (imgId) => {
    const { optionFields } = this.state;
    const newImages = optionFields.Images || [];
    const idx = newImages.findIndex(i => i["id"] == imgId);

    if (idx >= 0) {
      newImages.splice(idx, 1);
      optionFields.Images = newImages;
      this.setState({ optionFields });
    }
  }

  onChangeFor(attr) {
    return (e, { value }) => {
      const { optionFields } = this.state;
      optionFields[attr] = value;
      this.setState({ optionFields });
    }
  }

  onSave = (saveAll = false) => {
    const { option, selection } = this.props;
    const { optionId, optionFields } = this.state;

    if (this.isNew) {
      ActionCreators.addNewOption(selection["id"], optionFields);
    } else {
      ActionCreators.updateOption(optionId, optionFields, saveAll);
    }

    this.onClose();
  }

  onClose = () => {
    this.props.dispatch(ActionCreators.updateModal({ optionId: null }));
  }

  render() {
    const { optionsWithSameName, option } = this.props;
    const { optionFields, linkUpload } = this.state;
    const images = optionFields.Images || [];

    return (
      <Modal open={true} className="finish-option-modal">
        <Modal.Content>
          <div style={{ textAlign: "right" }}>
            <Icon name="close" onClick={this.onClose} />
          </div>
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Name"
                placeholder='CANARM 7" Disc Light LED - White'
                value={optionFields.name || ""}
                onChange={this.onChangeFor("name")}
              />
            </Form.Group>

            <div className="field">
              <label>Images</label>
              <Grid>
                <Grid.Row>
                  {images.map((image) => (
                    <Grid.Column width={8} key={image["id"] || image["url"]}>
                      <Image src={image["url"]} />
                      <span><a href="#/ " onClick={_=>this.removeImage(image["id"])}>Remove</a></span>
                    </Grid.Column>
                  ))}
                  {images.length < 2 &&
                    <Grid.Column width={8}>
                      <label>Drop or select a file.</label>
                      <StyledDropzone onDrop={this.onDrop} />
                      <label>Or upload using a link.</label>
                      <div>
                        <Input
                          fluid
                          icon="linkify"
                          iconPosition="left"
                          placeholder="https://..."
                          value={linkUpload}
                          onChange={this.onChangeLink}
                          action={{
                            icon: "upload",
                            content: "Upload",
                            onClick: this.onClickLinkUpload,
                          }}
                        />
                      </div>
                    </Grid.Column>
                  }
                </Grid.Row>
              </Grid>
            </div>
            <Form.Input
              label="Product URL"
              placeholder="http://...."
              value={optionFields.url || ""}
              onChange={this.onChangeFor("url")}
            />
            <Form.TextArea
              label='Notes'
              placeholder='Add notes about this option...'
              value={optionFields.info || ""}
              onChange={this.onChangeFor("info")}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button
              negative
              onClick={this.onClose}
            >Cancel</Button>
            {!this.isNew && (optionsWithSameName || []).length > 0 ?
              <Popup
                on="click"
                content={
                  <div>
                    <p className="bold">
                      Do you want to make these changes to all options named "{option.name}" in this project?
                    </p>
                    <Button color="blue" onClick={_ => this.onSave(false)}>No</Button>
                    <Button color="green" onClick={_ => this.onSave(true)}>Yes</Button>
                  </div>
                }
                trigger={
                  <Button
                    positive
                    icon='checkmark'
                    labelPosition='right'
                    content='Save'
                  />
                }
              />
              :
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Save'
                onClick={_ => this.onSave(false)}
              />
            }
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect((reduxState, props) => {
  const { optionId } = props;
  const option = reduxState.options[optionId];
  const fields = option;

  return {
    option: option,
    selection: reduxState.selections[props.selectionId],
    optionsWithSameName: Object.values(reduxState.options).filter(o => {
      return o.name == fields.name && o.id != optionId;
    }),
  };
}, null)(FinishOptionModal);

