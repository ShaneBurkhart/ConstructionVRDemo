import React from 'react';

class FinishSelectionAdminControls extends React.Component {
  render() {
    const { selectionId, onClickEdit, dragHandleProps } = this.props;

    return (
      <div className="selection-admin-controls">
        <div {...dragHandleProps}>D</div>
        <div onClick={onClickEdit}>E</div>
      </div>
    );
  }
}

export default FinishSelectionAdminControls;

