import React from 'react';
import * as _ from 'underscore';
import { Form, Input, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';

import FinishOption from "./FinishOption"

class FinishSelectionLinkOptionModal extends React.Component {
  constructor(props) {
    super(props);

    const selection = props.selection || {};

    this._originalCategory = (selection["fields"] || {})["Category"][0];

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
    const { onSave, onClose } = this.props;
    const { selection, selectedOption } = this.state;
    const newOptions = selection["Options"] || [];

    newOptions.push(selectedOption);

    onSave(this._originalCategory, {
      "id": selection["id"],
      "fields": selection["fields"],
      "Options": newOptions
    });
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
    const { onClose } = this.props;
    const { selection, options, searchQuery, selectedOption } = this.state;

    return (
      <Modal open={true}>
        <Modal.Header style={{ display: "flex" }}>
          <div style={{ width: "100%" }}>
            <p style={{ marginBottom: 0 }}><span>Link To:</span> {selection["fields"]["Name"]}</p>
            <div style={{ fontSize: 14, marginBottom: 0 }}>
              <Input value={searchQuery} onChange={this._handleSearch} placeholder="Search for options..." />
            </div>
          </div>
          <span style={{ float: "right" }}>
            <Icon name="close" onClick={onClose} />
          </span>
        </Modal.Header>
        <Modal.Content scrolling style={{ height: "100vh", position: "relative" }}>
          {options.map(o => (
            <FinishOption
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
              <span className="bold">Selected:</span> {selectedOption && selectedOption["fields"]["Name"]}
            </p>
          </div>
          <Button
            negative
            onClick={onClose}
          >Cancel</Button>
          <Button
            positive
            icon='linkify'
            labelPosition='right'
            content='Link'
            onClick={this.onSave}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FinishSelectionLinkOptionModal;
