import React, { useState } from 'react';
import { Modal, Icon } from 'semantic-ui-react';

import styles from './ShareLinkModal.module.css';


const ShareLinkModal = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const link = window.location.href;

  const handleHideMessage = () => setTimeout(() => setShowMessage(false), 600);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(
      () => setMessage("copied!"),
      () => setMessage("could not copy")
    );
    setShowMessage(true);
    handleHideMessage();
  };
  
  return (
    <Modal
      closeIcon
      open={true}
      onClose={onClose}
    >
      <Modal.Header className={`${styles.center} ${styles.modalHeader}`}>
        Share Link
      </Modal.Header>
      <Modal.Content className={styles.center}>
        <div className={styles.link}>{link}</div>
        <br />
        <span onClick={copyToClipboard} className={styles.clipboardBtn}>
          <Icon name="copy outline"/>
          Copy to Clipboard
          {showMessage && <span className={styles.successMsg}>{message}</span>}
        </span>
      </Modal.Content>
    </Modal>
  );
}

export default ShareLinkModal;
