import React from 'react';

import { Popup, Label } from 'semantic-ui-react'

import SearchThumbnail from './SearchThumbnail'

function SearchThumbnailSection(props) {
  const { header, grid, options, onClickShowMore, onLinkOptionToSelection } = props;

  const gridStyle = { textAlign: "center" };
  const scrollStyle = {
    overflowX: "scroll", overflowY: "hidden", whiteSpace: "nowrap"
  };

  return (
    <div className="search-thumbnail-row">
      <h3>{header}</h3>
      {onClickShowMore && <a onClick={onClickShowMore}>View More</a>}
      <div style={!grid ? scrollStyle : gridStyle}>
        {options.map((option) => (
          <SearchThumbnail
            key={option["id"]}
            option={option}
            onLinkOptionToSelection={onLinkOptionToSelection}
            />
        ))}
      </div>
    </div>
  );
}

export default SearchThumbnailSection


