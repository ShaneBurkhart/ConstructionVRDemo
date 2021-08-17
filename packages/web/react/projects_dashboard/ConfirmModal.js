import React, { useState } from 'react';
import { Header, Input, Button, Modal, Dimmer, Loader } from "semantic-ui-react";


const ConfirmModal = ({ onSubmit, onClose, modalMessage, setConfirmProject }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    onSubmit();
    setConfirmProject({});
    onClose();
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="tiny"
    >
      <Modal.Header style={{ backgroundColor: '#e2e2e2' }}>{modalMessage}</Modal.Header>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="green"
          disabled={loading}
        >
          Yes
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default ConfirmModal;
