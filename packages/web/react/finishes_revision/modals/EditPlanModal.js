import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer, Icon } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";

import ActionCreators from '../action_creators';

import './NewPlanModal.css';


const EditPlanModal = ({ onClose, plan }) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(plan.url);
  const [filename, setFilename] = useState(plan.filename);

  const onRemove = () => {
    setUrl('');
    setFilename('');
  };
  
  const onSubmit = () => {
    setLoading(true);
    const onSuccess = () => onClose();
    const onError = () => onClose();
    
    ActionCreators.updatePlan(plan.id, { url, filename }, onSuccess, onError);
  }
  
  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    if (loading) return;
    const file = acceptedFiles[0];

    setLoading(true);
    
    ActionCreators.presignedURL(
      file,
      (data) => {
        setFilename()
        ActionCreators.uploadFile(
          file,
          data.presignedURL,
          function onUploadFileSuccess() {
            setFilename(file.name || '');
            setUrl(data.awsURL);
            setLoading(false);
          },
          function onUploadFileError() {
            setLoading(false);
          },
        );
      },
      function onPresignError() {
        setLoading(false);
      },
    );
  }

  return (
    <Modal
      closeIcon
      open={true}
      onClose={onClose}
      closeOnDimmerClick={false}
      className="newPlanModal"
      size="small"
    >
      <Modal.Header>
        Add a New Document to {plan.name}
      </Modal.Header>
      <Modal.Content>
        {!!url && (
          <>
            <div className="link">
              <Icon name="paperclip" style={{ color: 'grey' }} />
              <a href={url} target="_blank" style={{ marginLeft: 5 }}>{filename || url}</a>
            </div>
            <a href="#/" onClick={onRemove} style={{ marginTop: 10, display: 'inline-block' }}>Remove</a>
          </>
        )}
        {!url && (
          <div className="field">
            <StyledDropzone  onDrop={onDrop} accept={null} acceptMultiple={false} />
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="green"
          onClick={onSubmit}
          disabled={loading || !url}
        >
          Add a New Document
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default EditPlanModal;
