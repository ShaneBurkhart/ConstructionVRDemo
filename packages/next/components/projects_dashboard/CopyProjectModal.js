import React, { useState } from 'react';
import { Header, Input, Button, Modal, Dimmer, Loader } from "semantic-ui-react";


const CopyProjectModal = ({ onSubmit, onClose, projectToCopy, setProjectToCopy }) => {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetNewName = e => setNewName(e.target.value);
  const handleSubmit = () => {
    setLoading(true);
    onSubmit(newName);
    setProjectToCopy({});
    onClose();
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="tiny"
    >
      <Modal.Header style={{ backgroundColor: '#e2e2e2' }}>Copy Project "{projectToCopy.name}"</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Give your project a new name</Header>
          <Input 
            type="text" 
            name="name" 
            value={newName}
            onChange={handleSetNewName}
            style={{ width: "100%" }}
          />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="green"
          disabled={loading}
        >
          Submit
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default CopyProjectModal;
