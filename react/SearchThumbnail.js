import React from 'react';

import { Popup, Label, Image } from 'semantic-ui-react'

function SearchThumbnail(props) {
  const { option, onLinkOptionToSelection } = props;
  const { fields } = option;

  const image = (fields["Image"] || [])[0] || {}

  return (
    <Popup
      position="top left"
      pinned
      trigger={
        <div style={{ width: "175px", display: "inline-block" }}>
          <div style={{ height: "175px", overflowY: "hidden" }}>
            <img style={{ width: "175px" }} src={image["url"]} />
          </div>
          <Label style={{ height: "40px", whiteSpace: "normal", overflowY: "hidden" }}>
            {fields["Name"].slice(0, 35)}{fields["Name"].length > 35 ? "..." : ""}
          </Label>
        </div>
      }
      >
    </Popup>
  );
}

export default SearchThumbnail


