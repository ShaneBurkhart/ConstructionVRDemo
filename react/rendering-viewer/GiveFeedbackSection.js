import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'
import { v4 as uuidv4 } from 'uuid';

AWS.config.update({
  region: "us-west-2",
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWS_IDENTITY_POOL_ID,
  })
});
const s3 = new AWS.S3({ params: { Bucket: "construction-vr" } });

const dataURItoBlob = (dataURI) => {
  const binary = atob(dataURI.split(',')[1]);
  const array = [];

  for(var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
}

const uploadToS3 = (data, filePath, opts, callback) => {
  opts = opts || {};
  opts["Key"] = filePath;
  opts["Body"] = data;
  opts["ACL"] = 'public-read';

  s3.upload(opts, function (err, data) {
    if (err) return callback(err, null);

    var uploadLocation = data["Location"];
    callback(null, uploadLocation);
  });
}

const uploadImageToS3 = (viewer, callback) => {
  var jpegBase64 = viewer.stage().takeSnapshot();
  var jpegData = dataURItoBlob(jpegBase64);
  var fileName = uuidv4()  + ".jpeg";
  var filePath = "feedback_perspectives/" + fileName;

  uploadToS3(jpegData, filePath, {}, function (err, s3Url) {
    if (callback) callback(s3Url)
  });
}

const GiveFeedbackSection = (props) => {
  const { imageURL, viewer } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  const onUploadImage = (url) => {
    const data = {
      unitVersionId: _unitVersionId,
      imageURL: url,
      notes: value,
    };

    $.ajax({
      type: "POST",
      url: "/project/" + _accessToken + "/screenshot/feedback",
      data: data,
      complete: function (res, resStatus) {
        setLoading(false);

        if (resStatus === "error") {
          alert("There was an error when submitting.");
          return
        }

        setValue("")
      },
    });
  };

  const onSubmit = (e) => {
    if (viewer) {
      uploadImageToS3(viewer, (s3URL) => {
        onUploadImage(s3URL);
      });
    } else {
      onUploadImage(imageURL);
    }
  };

  return (
    <div className="give-feedback">
      {!open && <a onClick={_=>setOpen(true)}>+ Give Feedback</a>}
      {open &&
        <div>
          {loading &&
            <div className="ui inverted dimmer active">
              <div className="ui grey header content">Sending...</div>
            </div>
          }
          <a onClick={_=>setOpen(false)}>Close Feedback</a>
          <textarea
            value={value}
            placeholder="Enter your feedback here..."
            onChange={e=>setValue(e.target.value)}
          />
          <Button color="blue" onClick={onSubmit}>Submit Feedback</Button>
        </div>
      }
    </div>
  )
}

export default GiveFeedbackSection;
