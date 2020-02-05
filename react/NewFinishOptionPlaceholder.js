import React from 'react';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import './NewFinishOptionPlaceholder.css';

class NewFinishOptionPlaceholder extends React.Component {
  constructor(props) {
    super(props);
  }

  onClickNew = (e) => {
    const { onClickNew } = this.props;
    e.stopPropagation();
    if (onClickNew) onClickNew();
  }

  onClickLink = (e) => {
    const { onClickLink } = this.props;
    e.stopPropagation();
    if (onClickLink) onClickLink();
  }

  render() {
    return (
      <div style={{ display: "flex" }}>
        <div className="half">
          <div className="finish-option-placeholder link hide-print" onClick={this.onClickLink}>
            <Icon name="linkify" />
            Link From Library
          </div>
        </div>
        <div className="half" style={{ paddingLeft: 5 }}>
          <div className="finish-option-placeholder hide-print" onClick={this.onClickNew}>
            <Icon name="plus circle" />
            Create New Option
          </div>
        </div>
      </div>
    );
  }
}

export default NewFinishOptionPlaceholder;
