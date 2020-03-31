import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { Form, Input, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';

import FinishOptionSearchResult from "./FinishOptionSearchResult"

class FinishSelectionLinkOptionModal extends React.Component {
  constructor(props) {
    super(props);

    const selection = props.selection || {};

    this._originalCategory = selection.CategoryId;
    this.newId = "new" + Math.random().toString(36).substring(2, 15);

    this._handleSearch = e => {
      const query = e.target.value;
      this.setState({ isLoading: true, searchQuery: query });
      this._debounceSearch(query);
    }

    this._debounceSearch = _.debounce(q => {
      ActionCreators.searchOptions(q, (data) => {
        const options = Array.from(data.options);

        this.setState({
          isLoading: false,
          options: options,
        });
      });
    }, 500);

    this.state = {
      isLoading: true,
      options: [],
      searchQuery: "",
      selectedOption: props.selectedOption || null,
      selection: selection,
    };
  }

  componentDidMount() {
    ActionCreators.searchOptions("", (data) => {
      const options = Array.from(data.options);

      this.setState({
        isLoading: false,
        options: options,
      });
    });
  }

  onClickOption = (option) => {
    this.setState({ selectedOption: option });
  }

  onSave = () => {
    const { selection, selectedOption } = this.state;
    const newSelectionFields = selection;
    const newOptions = newSelection.Options || [];
    const optionFields = selectedOption;
    optionFields.Images = (optionFields.Images || []).map(img => ({ url: img.url }));

    ActionCreators.addNewOption(selection.id, optionFields);
    this.onClose();
  }

  onClose = () => {
    this.props.dispatch(ActionCreators.updateModal({ linkSelectionId: null }));
  }

  renderLoading() {
    const { isLoading } = this.state;
    if (!isLoading) return "";

    return (
      <div className="ui inverted dimmer active">
        <div className="ui grey header content">Loading...</div>
      </div>
    );
  }

  render() {
    const { selection, options, searchQuery, selectedOption } = this.state;

    return (
      <Modal open={true}>
        <Modal.Header style={{ display: "flex" }}>
          <div style={{ width: "100%" }}>
            <p style={{ marginBottom: 0 }}><span>Add To:</span> {selection.name}</p>
            <div style={{ fontSize: 14, marginBottom: 0 }}>
              <Input value={searchQuery} onChange={this._handleSearch} placeholder="Search for options..." />
            </div>
          </div>
          <span style={{ float: "right" }}>
            <Icon name="close" onClick={this.onClose} />
          </span>
        </Modal.Header>
        <Modal.Content scrolling style={{ height: "100vh", position: "relative" }}>
          {options.map(o => (
            <FinishOptionSearchResult
              short
              key={o["id"]}
              option={o}
              onClick={this.onClickOption}
            />
          ))}
          {this.renderLoading()}
        </Modal.Content>
        <Modal.Actions style={{ display: "flex" }}>
          <div style={{ width: "100%", textAlign: "left" }}>
            <p style={{ fontSize: 14, lineHeight: 1.2 }}>
              <span className="bold">Selected:</span> {selectedOption && selectedOption.name}
            </p>
          </div>
          <Button
            negative
            onClick={this.onClose}
          >Cancel</Button>
          <Button
            positive
            icon='circle plus'
            labelPosition='right'
            content='Add'
            onClick={this.onSave}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect((reduxState, props) => {
  return {
    selection: reduxState.selections[props.selectionId],
  };
}, null)(FinishSelectionLinkOptionModal);
