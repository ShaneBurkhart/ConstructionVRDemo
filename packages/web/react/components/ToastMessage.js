import React, { useState, useEffect } from 'react';
import { Message } from 'semantic-ui-react';

const ToastMessage = ({ positive=true, message="", bottom=15, left=15, timeout=3000 }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    setShow(true);

    const _id = setTimeout(() => {
      setShow(false);
    }, timeout);
    
    return () => {
      clearTimeout(_id);
    }
  }, [positive, timeout, message]);

  if (!show || !message) return "";

  return (
    <Message 
      size="big"
      success={positive}
      negative={!positive}
      style={{ 
        position: 'fixed',
        bottom,
        left,
        zIndex: 999999,
      }}
    >
      {message}
    </Message>
  );
};


export default ToastMessage;