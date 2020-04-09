import React, { createRef } from 'react';
import { Segment, Input, Label, Icon, Button, Popup, Checkbox, Dropdown } from 'semantic-ui-react'

class AddSelectionLocationPopup extends React.Component {
  constructor(props) {
    super(props);

    this.addLocationRef = createRef();

    this.state = {
      currentSearch: "",
      isOpen: false,
    };
  }

  onChangeOpen = (isOpen) => {
    const newState = { isOpen };
    if (isOpen) newState.currentSearch = "";
    this.setState(newState);
  }

  onChangeSearch = (e, data) => {
    this.setState({ currentSearch: data.value });
  }

  onAdd = (name) => {
    const { onAddLocation } = this.props;
    onAddLocation(name.trim());
    this.onChangeOpen(false);
  }

  render() {
    const { openPopup, selection, locations, onAddLocation } = this.props;
    const { currentSearch, isOpen } = this.state;
    const locationOptions = locations.map(l => ({
      key: l, value: l, text: l,
    }));
    const newId =  Math.random().toString(36).substring(2, 15);

    return (
      <div>
        <div className="hide-print" style={{ marginBottom: 3 }} ref={this.addLocationRef}>
          <Label basic size="tiny" onClick={e=>{e.preventDefault();this.onChangeOpen(!isOpen)}}>
            + Add Location
          </Label>
        </div>
        <Popup
          on="click"
          open={isOpen}
          position="bottom left"
          onOpen={_=>this.onChangeOpen(true)}
          onClose={_=>this.onChangeOpen(false)}
          context={this.addLocationRef}
          content={
            <div style={{ maxWidth: "100%", width: 300 }}>
              <Segment vertical style={{ paddingTop: 0 }}>
                <Input
                  icon='search'
                  iconPosition='left'
                  className='search'
                  onChange={this.onChangeSearch}
                  value={currentSearch}
                  />
              </Segment>
              <Segment vertical style={{
                maxHeight: 300,
                overflowY: "scroll",
                border: "1px solid #e0e0e0",
                padding: 0
              }}>
                  {locationOptions.filter(o => (
                    !(selection.SelectionLocations || []).map(sl=>sl.location)
                        .includes(o.value)
                  )).filter(o => (
                    o.value != "Not Specified" && (o.value || "").toLowerCase().includes(currentSearch.toLowerCase())
                  )).map((option) => (
                    <Segment
                      vertical
                      key={option.value}
                      style={{ padding: 5, cursor: "pointer" }}
                      onClick={_=>this.onAdd(option.value)}
                    >
                      {option.text}
                    </Segment>
                  ))}
                  {currentSearch &&
                    <Segment
                      vertical
                      style={{ padding: 5, cursor: "pointer" }}
                      onClick={_=>this.onAdd(currentSearch)}
                    >
                      {`+ Add "${currentSearch}"`}
                    </Segment>
                  }
              </Segment>
            </div>
          }
          />
      </div>
    );
  }
}

export default AddSelectionLocationPopup;
