import React from 'react';
import { Message } from 'semantic-ui-react';

const ToastMessage = ({ positive=true, message="", bottom=5, right=5 }) => {
  return (
    <Message 
      size="big"
      style={{ 
        position: 'fixed',
        bottom,
        right,
        zIndex: 999999,
        backgroundColor: positive ? '#12c712c7' : '#ff3b3bf2',
        color: 'white' 
      }}
    >
      {message}
    </Message>
  );
};


export default ToastMessage;