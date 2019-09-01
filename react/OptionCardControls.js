import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Popup, Button } from 'semantic-ui-react'

import ActionCreators from './action_creators';

class OptionCardControls extends React.Component {
  render() {
    const { option, selection, isSearch, isLibrary, isAdmin } = this.props;
    const {
      onUnlinkOption,
      onOpenEditOption,
    } = this.props;

    return (
      <div className="extra content">
        {isLibrary && <div className="pull-right">FinishVisionVR Library</div>}

        {isSearch && <a className="ui">+ Link Option to Selection</a>}
        {!isSearch &&
            <Popup
              on="click"
              trigger={<a className="ui">Unlink Option</a>}
              content={<Button color="red" onClick={onUnlinkOption}>Are you sure?</Button>}
            />
        }

        &mdash;

        <a className="ui" onClick={onOpenEditOption}>Edit Option</a>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
  }),
  (dispatch, props) => (bindActionCreators({
    onOpenEditOption: () => (ActionCreators.openEditOptionModal(props.option.id)),
    onUnlinkOption: () => (ActionCreators.unlinkOption(
      props.selection.id,
      props.option.id
    ))
  }, dispatch))
)(OptionCardControls);
