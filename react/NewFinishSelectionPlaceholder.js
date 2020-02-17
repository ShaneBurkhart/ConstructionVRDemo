import React from 'react';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import './NewFinishSelectionPlaceholder.css';

class NewFinishSelectionPlaceholder extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick = (e) => {
    const { onClick } = this.props;
    e.stopPropagation();
    if (onClick) onClick();
  }

  render() {
    return (
      <div className="finish-selection-placeholder hide-print" onClick={this.onClick}>
        <Icon name="plus circle" />
        Click Here to Add Finish Selection
      </div>
    );
  }
}

export default NewFinishSelectionPlaceholder;

