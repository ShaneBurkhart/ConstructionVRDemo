// TODO: delete (?) main purpose of this modal was moved to NewPlanModal
import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer, Popup } from 'semantic-ui-react';

import StyledDropzone from "../../components/StyledDropzone";

import ActionCreators from '../action_creators';

import './ProjectDocumentModal.css';


const ProjectDocumentModal = ({ onClose, docUrl }) => {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(docUrl);

  const onDelete = () => setDocumentUrl('');
  const onSubmit = () => {
    setLoading(true);
    const onSuccess = () => {
      setLoading(false);
      onClose();
    }
    const onError = () => {
      setLoading(false);
      onClose();
    }
    ActionCreators.addEditProjectDoc(documentUrl, onSuccess, onError);
  }
  
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

  const renderPrimaryButton = () => {
    if (docUrl && !documentUrl) {
      return (
        <Popup
          on="click"
          onClose={e => e.stopPropagation()}
          content={
            <div>
              <p>The previous document will be deleted from this project</p>
              <Button color="red" onClick={onSubmit}>Ok</Button>
            </div>
          }
          trigger={
            <Button color="green">Save</Button>
          }
        />
      );
    } else {
      return (
        <Button
          onClick={onSubmit}
          color="green"
          disabled={docUrl === documentUrl}
        >
          Save
        </Button>
      )
    }
  }

  return (
    <Modal
      closeIcon
      open={true}
      onClose={onClose}
      closeOnDimmerClick={false}
      className="project_document_modal"
      size="tiny"
    >
      <Modal.Header className="modalHeader">
        {!docUrl && <>Upload a document for this project</>}
        {!!docUrl && <>Current project document</>}
      </Modal.Header>
      <Modal.Content>
        {!!documentUrl && (
          <>
            <div className="link">
              <span>📎</span>
              <a href={documentUrl} target="_blank" style={{ marginLeft: 5 }}>{documentUrl}</a>
            </div>
            <a href="#/" onClick={onDelete} style={{ marginTop: 10, display: 'inline-block' }}>Remove</a>
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
          {renderPrimaryButton()}
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default ProjectDocumentModal;
