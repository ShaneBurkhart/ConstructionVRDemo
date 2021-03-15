import React, {useMemo} from 'react';
import {useDropzone} from 'react-dropzone';
import { Icon } from 'semantic-ui-react'

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
};

const activeStyle = {
};

const acceptStyle = {
};

const rejectStyle = {
};

function StyledDropzone(props) {
  const { onDrop, acceptSKP=false } = props;
  const acceptedMimeTypes = acceptSKP ? 'application/*' : 'image/*';
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: acceptedMimeTypes,
    onDrop: onDrop
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject
  ]);

  return (
    <div className="image-placeholder">
      <div {...getRootProps({style})}>
        <input {...getInputProps()} />
        <p><Icon name="upload" /> Drop files here, or click to select.</p>
      </div>
    </div>
  );
}

export default StyledDropzone;
