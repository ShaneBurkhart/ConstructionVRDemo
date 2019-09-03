import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import { Select, Button, Header, Image, Modal, Input, Form } from 'semantic-ui-react'

import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

// Register the plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const options = [
  "Concepts",
  "Flooring",
  "Light Fixture",
  "Bath Accessories",
  "Appliance",
  "Plumbing Fixture",
  "Tile",
  "Exterior",
  "Cabinet/Countertop",
  "Paint Color",
  "LVT - Luxury Vinyl Tile",
  "Millwork",
  "Furniture",
  "Mirrors",
  "Art",
  "Misc",
  "Blinds",
  "Shelving",
  "Doors",
  "Other"
].map((v, i) =>({ key: v, text: v, value: v }))

class EditOptionModal extends React.Component {
  constructor(props) {
    super(props);
    const { option, selection } = props;
    const { fields } = option;

    this.onSave = this.onSave.bind(this);

    this.state = {
      id: option.id,
      selection_id: (selection || {}).id,
      name: fields["Name"] || "",
      type: fields["Type"] || "",
      unit_price: fields["Unit Price"] || "",
      url: fields["URL"] || "",
      info: fields["Info"] || "",
      other_value: fields["Other Type Value"] || "",

      images: (fields["Image"] || []).map((i) => ({
        source: i["url"],
        options: { type: "local" },
      })),
    }
  }

  createUpdateFieldHandler(field) {
    return (e) => { this.setState({ [field]: e.target.value || e.target.innerText }) }
  }

  onSave() {
    const { option, selection, saveOption } = this.props;
    const data = _.extend({}, this.state);

    data.images = data.images.map((i) => (i.serverId));

    saveOption(data, (selection || {}).id);
  }

  render() {
    const { option, closeModal, projectAccessToken } = this.props;
    const { fields } = option;

    return (
      <Modal open={!!option}>
        <Modal.Header>
          Editing: <span className="bold">{fields["Name"] || "New Finish"}</span>
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input
                type="text"
                value={this.state.name}
                onChange={this.createUpdateFieldHandler("name")}
                />
            </Form.Field>
            <Form.Field>
              <label>Type</label>
              <Select
                value={this.state.type}
                options={options}
                onChange={this.createUpdateFieldHandler("type")}
                />
            </Form.Field>
            {this.state.type == "Other" &&
              <Form.Field>
                <label>Other Value</label>
                <input
                  type="text"
                  value={this.state.other_value}
                  onChange={this.createUpdateFieldHandler("other_value")}
                  />
              </Form.Field>
            }
            <Form.Field>
              <label>URL</label>
              <input
                type="text"
                value={this.state.url}
                onChange={this.createUpdateFieldHandler("url")}
                />
            </Form.Field>
            <Form.Field>
              <label>Info</label>
              <textarea
                value={this.state.info}
                onChange={this.createUpdateFieldHandler("info")}
                />
            </Form.Field>
            <Form.Field>
              <label>Images (2 maximum)</label>
              <FilePond
                ref={ref => (this.pond = ref)}
                files={this.state.images}
                allowMultiple={true}
                maxFiles={2}
                server={"/api/project/" + projectAccessToken + "/finishes/options/images/upload"}
                acceptedFileTypes={['image/png', 'image/jpeg']}
                onupdatefiles={fileItems => {
                  // Set currently active file objects to this.state
                  this.setState({
                    images: fileItems.map(fileItem => fileItem)
                  });
                }}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeModal}>Close</Button>
          <Button color="blue" onClick={this.onSave}>Save</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(
  (state, props) => ({
    projectAccessToken: state.project.fields["Access Token"],
    editOption: state.options_by_id[state.modals.editOptionId],
  }),
  (dispatch, props) => (bindActionCreators({
    loadProject: () => (ActionCreators.load()),
    closeModal: () => (ActionCreators.closeEditOptionModal()),
    saveOption: (option, selectionId) => (ActionCreators.saveOption(option, selectionId)),
  }, dispatch))
)(EditOptionModal);
