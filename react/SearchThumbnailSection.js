import React from 'react';

import { Popup, Label } from 'semantic-ui-react'

import SearchThumbnail from './SearchThumbnail'

function SearchThumbnailSection(props) {
  const { header, options, onClickShowMore, onLinkOptionToSelection } = props;

  return (
    <div className="search-thumbnail-row">
      <h3>{header}</h3>
      {onClickShowMore && <a onClick={onClickShowMore}>View More</a>}
      <div style={{ overflowX: "scroll", overflowY: "hidden", whiteSpace: "nowrap" }}>
        {options.map((option) => (
          <SearchThumbnail key={option["id"]} option={option} />
        ))}
      </div>
    </div>
  );
}

export default SearchThumbnailSection


