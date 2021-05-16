import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";

import ActionCreators from '../action_creators';

import './ProjectDocumentModal.css';


const ProjectDocumentModal = ({ onClose, projectDocUrl }) => {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(projectDocUrl);

  const onDelete = () => setDocumentUrl('');
  const handleSubmit = () => {}
  
  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    if (loading) return;
    if (acceptedFiles.length > 1) acceptedFiles.length = 1;

    setLoading(true);
    ActionCreators.presignedURL(
      acceptedFiles[0],
      (data) => {
        ActionCreators.uploadFile(
          acceptedFiles[0],
          data.presignedURL,
          function onUploadFileSuccess() {
            setDocumentUrl(data.awsURL);
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
      className="project_document_modal"
      size="tiny"
    >
      <Modal.Header className="modalHeader">
        {!projectDocUrl && <>Upload a document for this project</>}
        {!!projectDocUrl && <>Current project document</>}
      </Modal.Header>
      <Modal.Content>
        {!!documentUrl && (
          <>
            <div className="link">
              <span>📎</span>
              <a href={documentUrl} target="_blank" style={{ marginLeft: 5 }}>{documentUrl}</a>
            </div>
            <a href="#/" onClick={onDelete}>Remove</a>
          </>
        )}
        {!documentUrl && (
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
            onClick={handleSubmit}
            color="green"
            disabled={projectDocUrl === documentUrl}
          >
            Save
          </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default ProjectDocumentModal;
