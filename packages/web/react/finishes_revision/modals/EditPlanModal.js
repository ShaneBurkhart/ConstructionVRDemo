import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer, Icon } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";

import ActionCreators from '../action_creators';

import './NewPlanModal.css';


const EditPlanModal = ({ onClose, plan }) => {
  const [loading, setLoading] = useState(false);
  const [s3Url, setS3Url] = useState(plan.s3Url);
  const [filename, setFilename] = useState(plan.filename);

  const onRemove = () => {
    setS3Url('');
    setFilename('');
  };
  
  const onSubmit = () => {
    setLoading(true);
    const onSuccess = () => onClose();
    const onError = () => onClose();
    
    ActionCreators.updatePlan(plan.id, { s3Url, filename }, onSuccess, onError);
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
            setS3Url(data.awsURL);
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
        Update Document for {plan.name}
      </Modal.Header>
      <Modal.Content>
        {!!s3Url && (
          <>
            <div className="link">
              <Icon name="paperclip" style={{ color: 'grey' }} />
              <a href={s3Url} target="_blank" style={{ marginLeft: 5 }}>{filename || s3Url}</a>
            </div>
            <a href="#/" onClick={onRemove} style={{ marginTop: 10, display: 'inline-block' }}>Remove</a>
          </>
        )}
        {!s3Url && (
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
          disabled={loading || !s3Url}
        >
          Update Document
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default EditPlanModal;
