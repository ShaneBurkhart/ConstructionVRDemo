import React, { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from '@heroicons/react/outline';

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

function StyledDropzone({ onDrop, accept, acceptMultiple=true, maxFiles=50 }) {
  const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject
    } = useDropzone({
        accept: (accept !== null) ? accept || 'image/*' : undefined,
        onDrop: onDrop,
        maxFiles
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
      <div className="p-5 text-center text-gray-400 border-2 border-gray-200 border-dashed rounded cursor-pointer bg-gray-50 hover:border-brightGreen hover:text-brightGreen">
        <div {...getRootProps({style})}>
          <input {...getInputProps()} multiple={acceptMultiple} />
          <p><UploadIcon className="w-5 h-5 m-auto" /> Drop file{acceptMultiple ? "s" : ""} here, or click to select.</p>
        </div>
      </div>
    );
}

export default StyledDropzone;
