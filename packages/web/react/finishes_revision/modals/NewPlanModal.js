import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer } from 'semantic-ui-react';
import { PaperClipIcon } from '@heroicons/react/outline'

import StyledDropzone from "../../components/StyledDropzone";

import ActionCreators from '../action_creators';

import './NewPlanModal.css';


const NewPlanModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [s3Url, setS3Url] = useState('');
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState('');

  const onRemove = () => {
    setS3Url('');
    setFilename('');
  };
  
  const onSubmit = () => {
    setLoading(true);
    const onSuccess = () => onClose();
    const onError = () => onClose();
    
    ActionCreators.addNewPlan({ s3Url, filename }, onSuccess, onError);
  }
  
  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    if (loading) return;
    const file = acceptedFiles[0];

    setUploading(true);
    
    ActionCreators.presignedURL(
      file,
      (data) => {
        setFilename(file.name || '');
        ActionCreators.uploadLargeFile(
          file,
          data.presignedURL,
          function onUploadFileSuccess() {
            setS3Url(data.awsURL);
            setUploading(false);
            setProgress(0);
          },
          function onUploadFileError() {
            setFilename('')
            setUploading(false);
            setProgress(0);
          },
          function onProgress(percentComplete){
            setProgress(percentComplete);
          }
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
        Add a New Document
      </Modal.Header>
      <Modal.Content>
        {!!s3Url && (
          <>
            <div className="link">
              <div className="flex items-center">
                <PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
                <a className="text-blue-600" href={s3Url} target="_blank" style={{ marginLeft: 5 }}>{filename || s3Url}</a>
              </div>
            </div>
            <a href="#/" onClick={onRemove} style={{ marginTop: 10, display: 'inline-block' }}>Remove</a>
          </>
        )}
        {!s3Url && !uploading && (
          <div className="field">
            <StyledDropzone  onDrop={onDrop} accept={null} acceptMultiple={false} />
          </div>
        )}
        {uploading && (
          <div className="link">
            <div className="flex items-center">
              <PaperClipIcon className="w-4 h-4 mr-5 text-gray-500" />
              <span className="ml-2 text-gray-500">{filename}</span>
            </div>
            <div className="relative px-10 pt-1">
              <div className="text-xs text-gray-400">Loading {progress}%</div>
              <div className="flex h-2 mb-4 overflow-hidden text-xs bg-green-200 rounded">
                <div style={{ width: `${progress}%` }} className="flex flex-col justify-center text-center text-white bg-green-400 shadow-none whitespace-nowrap"></div>
              </div>
            </div>
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
          Add a New Document
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default NewPlanModal;
