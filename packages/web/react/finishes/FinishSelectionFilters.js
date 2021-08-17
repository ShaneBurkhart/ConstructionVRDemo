import React from 'react';
import { Icon, Dropdown, Label, Button, Input } from 'semantic-ui-react'

import ActionCreators from './action_creators';

class FinishSelectionFilters extends React.Component {
  onChange = (e, data) => {
    const { onChangeFilters, currentFilters } = this.props;
    const newFilters = { ...currentFilters };

    newFilters.locations = [...newFilters.locations, data.value];
    if (onChangeFilters) onChangeFilters(newFilters);
  }

  onRemove = (location) => {
    const { onChangeFilters, currentFilters } = this.props;
    const newFilters = { ...currentFilters };

    newFilters.locations = [ ...newFilters.locations ].filter(l=>(l != location));
    if (onChangeFilters) onChangeFilters(newFilters);
  }

  render() {
    const { currentFilters, filters, quickSearches } = this.props;
    const locationFilters = filters.locations || [];
    const currentLocationFilters = currentFilters.locations || [];
    const quickSearchLocations =  [ ...(quickSearches.locations || []) ];
    const quickSearchOptions = quickSearchLocations.splice(0,8).filter(q=>(
      !currentLocationFilters.includes(q)
    ));
    const locationOptions = [
      ...quickSearchOptions, ...locationFilters.sort()
    ].map((q, i)=>({
      key: q + i, value: q, text: q,
    }));

    return (
      <div className="no-print" style={{ marginBottom: 20 }}>
        <div className="filters" style={{ marginBottom: 10 }}>
          <Dropdown
              button
              className='icon'
              floating
              labeled
              icon='building'
              options={locationOptions}
              search
              text='Select Location'
              onChange={this.onChange}
            />
        </div>
        <div className="filters">
          {(currentFilters.locations || []).map(l => (
            <Label key={l}>
              {l} <Icon name="close" onClick={_=>this.onRemove(l)} />
            </Label>
          ))}
        </div>
      </div>
    )
  }
}

export default FinishSelectionFilters;
