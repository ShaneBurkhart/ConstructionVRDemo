import React from 'react';
import { Icon } from 'semantic-ui-react'

import "./AdminControls.css"

class AdminControls extends React.Component {
  render() {
    const { selectionId, onClickEdit, dragHandleProps } = this.props;

    return (
      <div className="admin-controls hide-print" onClick={(e) => e.stopPropagation()}>
        <div {...dragHandleProps}>
          <Icon name="bars" />
        </div>
      </div>
    );
  }
}

export default AdminControls;

