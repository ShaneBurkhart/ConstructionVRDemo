import React from 'react';
import { Icon, Button } from 'semantic-ui-react'

import './FloatingProjectButton.css';

class FloatingProjectButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { name } = this.props;

    return (
      <div className="floating-project-button-container">
        <Button icon labelPosition="right" onClick={_=>window.scrollTo(0,0)}>
          {name}
          <Icon name="up arrow" />
        </Button>
      </div>
    );
  }
}

export default FloatingProjectButton;
