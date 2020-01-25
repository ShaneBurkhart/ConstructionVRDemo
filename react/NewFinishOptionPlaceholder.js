import React from 'react';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import './NewFinishOptionPlaceholder.css';

class NewFinishOptionPlaceholder extends React.Component {
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
      <div className="finish-option-placeholder hide-print" onClick={this.onClick}>
        Click Here to Add Finish Option
      </div>
    );
  }
}

export default NewFinishOptionPlaceholder;
