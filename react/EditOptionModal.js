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
    const { option } = props;
    const { fields } = option;

    this.onSave = this.onSave.bind(this);

    this.state = {
      id: option.id,
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

      ask_to_link_to_selection: false,
    }
  }

  createUpdateFieldHandler(field) {
    return (e) => { this.setState({ [field]: e.target.value || e.target.innerText }) }
  }

  onSave() {
    const { option, selectingForSelection } = this.props;
    const data = _.extend({}, this.state);

    data.images = data.images.map((i) => (i.serverId));
    console.log(data);

    // Ask if we should link to selection
    if (selectingForSelection) {
      this.setState({ ask_to_link_to_selection: true });
    } else {
      this.props.saveOption(option.id, data);
    }
  }

  render() {
    const { option, closeModal, projectAccessToken } = this.props;
    const { fields } = option;

    return (
      <Modal open={!!option}>
        <Modal.Header>{fields["Name"]}</Modal.Header>
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
                onupdatefiles={fileItems => {
                  // Set currently active file objects to this.state
                  console.log(fileItems);
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

    isLoading: state.isLoading,
    editOption: state.options_by_id[state.modals.editOptionId],
    selectingForSelection: state.selections_by_id[state.modals.selectingForSelectionId],
    selections_by_category: state.selections_by_category
  }),
  (dispatch, props) => (bindActionCreators({
    loadProject: () => (ActionCreators.load()),
    closeModal: () => (ActionCreators.closeEditOptionModal()),
    saveOption: (id, option) => (ActionCreators.saveOption(id, option)),
  }, dispatch))
)(EditOptionModal);
