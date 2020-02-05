import React from 'react';
import { Icon } from 'semantic-ui-react'

import "./AdminControls.css"

class AdminControls extends React.Component {
  render() {
    const { selectionId, onClickUnlink, onClickTrash, dragHandleProps } = this.props;

    return (
      <div className="admin-controls hide-print" onClick={(e) => e.stopPropagation()}>
        {dragHandleProps &&
          <div {...dragHandleProps}>
            <Icon name="arrows alternate" />
          </div>
        }
        {onClickUnlink &&
          <div onClick={onClickUnlink}>
            <Icon name="unlink" />
          </div>
        }
        {onClickTrash &&
          <div onClick={onClickTrash}>
            <Icon name="trash" />
          </div>
        }
      </div>
    );
  }
}

export default AdminControls;

