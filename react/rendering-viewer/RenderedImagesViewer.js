import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import GiveFeedbackSection from './GiveFeedbackSection'

const RenderedImagesViewer = (props) => {
  const { images, admin_mode } = props;
  const [index, setIndex] = useState(0);
  const selectedImage = images[index];
  const selectedFullImgURL = selectedImage["Image URL"];
  const selectedLargeImgURL = selectedImage["Image URL"];//.gsub("\/screenshots\/", "\/screenshots-large\/")

  return (
    <div id="screenshots">
      <div className="screenshot-thumbnails">
        {images.map((i, k) => {
          const fullImgURL = i["Image URL"];
          const largeImgURL = i["Image URL"];//.gsub("\/screenshots\/", "\/screenshots-large\/")

          return (
            <div
              key={i["Record ID"]}
              className="screenshot-thumbnail"
              onClick={_=>setIndex(k)}
            >
              <img src={largeImgURL} />
            </div>
          );
        })}
      </div>

      <div className="screenshot">
        <h4>Scene: {index+1}</h4>
        <a><img src={selectedLargeImgURL} /></a>
      </div>

      {admin_mode &&
        <GiveFeedbackSection
          imageURL={selectedLargeImgURL}
        />
      }
    </div>
  );
};

export default connect((reduxState, props) => {
  return {
    admin_mode: reduxState.admin_mode,
    images: reduxState.image_data,
  };
}, null)(RenderedImagesViewer);
