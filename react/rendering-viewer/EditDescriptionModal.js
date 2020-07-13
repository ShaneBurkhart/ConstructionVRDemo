import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Icon, Button, Header, Image, Modal, Form } from 'semantic-ui-react'

import ActionCreators from './action_creators';

const EditDescriptionModal = (props) => {
  const { unit } = props;
  const [value, setValue] = useState(unit["Details"]);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    props.dispatch(ActionCreators.updateModal({ edit_description: null }));
  };

  const onUpdate = () => {
    const desc = value;
    setLoading(true);

    $.ajax({
      type: "POST",
      url: "/project/" + _accessToken + "/unit/" + unit["Record ID"] + "/set_description",
      data: { description: desc },
      complete: function (res, resStatus) {
        setLoading(false);

        if (resStatus === "error") {
          alert("There was an error when submitting.");
          return
        }

        props.dispatch(ActionCreators.updateUnit({ "Details": desc }));
        onClose();
      },
    });
  };

  return (
    <Modal open={true} className="finish-option-modal">
      <Modal.Header>
        Edit unit description.
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.TextArea
            label="Unit Description"
            placeholder='1000 sqft 1 bedroom, 1 bath apartment'
            value={value}
            onChange={e=>setValue(e.target.value)}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" onClick={onUpdate}>Update</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Modal.Actions>
      {loading &&
        <div className="ui inverted dimmer active">
          <div className="ui grey header content">Saving...</div>
        </div>
      }
    </Modal>
  );
}

export default connect((reduxState, props) => {
  return {
    unit: reduxState.unit,
  };
}, null)(EditDescriptionModal);

