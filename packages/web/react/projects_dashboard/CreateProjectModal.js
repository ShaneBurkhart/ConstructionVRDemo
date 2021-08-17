import React, { useState } from 'react';
import { Header, Input, Button, Modal, Dimmer, Loader } from "semantic-ui-react";


const CreateProjectModal = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetName = e => setName(e.target.value);
  const handleSubmit = () => {
    setLoading(true);
    onSubmit(name);
    onClose();
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="tiny"
    >
      <Modal.Header style={{ backgroundColor: '#e2e2e2' }}>Create a New Project</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Give your project a name</Header>
          <Input 
            type="text" 
            name="name" 
            value={name}
            onChange={handleSetName}
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

export default CreateProjectModal;
