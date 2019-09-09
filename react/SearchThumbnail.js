import React from 'react';

import { Button, Popup, Label, Image } from 'semantic-ui-react'

function SearchThumbnail(props) {
  const { option, onLinkOptionToSelection } = props;
  const { fields } = option;

  const name = fields["Name"] || ""
  const image = (fields["Image"] || [])[0] || {}

  return (
    <div style={{ width: "175px", display: "inline-block" }}>
      <div style={{ position: "relative", height: "175px", overflowY: "hidden" }}>
        <img style={{ width: "175px" }} src={image["url"]} />
        <div style={{ position: "absolute", top: "0", left: "0", width: "100%", textAlign: "center" }}>
          <Button
            color="green"
            size="small"
            onClick={() => {onLinkOptionToSelection(option.id)}}
            >
            Select
          </Button>
        </div>
      </div>
      <Label style={{ height: "40px", whiteSpace: "normal", overflowY: "hidden" }}>
        {name.slice(0, 35)}{name.length > 35 ? "..." : ""}
      </Label>
    </div>
  );
}

export default SearchThumbnail


