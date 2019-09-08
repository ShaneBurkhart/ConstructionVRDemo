import React from 'react';

import { Popup, Label } from 'semantic-ui-react'

import SearchThumbnailSection from './SearchThumbnailSection'

function SearchPromoPage(props) {
  const { isAdmin, selection, groupedOptions,
    onRedirectToSearch, onLinkOptionToSelection } = props;

  return (
    <div className="search-promo-page">
      {Object.keys(groupedOptions || {})
        .filter((k, i) => (groupedOptions[k].length))
        .map((k, i) => (
          <SearchThumbnailSection
            isAdmin={isAdmin}
            key={k}
            header={k}
            options={groupedOptions[k]}
            selection={selection}
            onClickShowMore={() => {onRedirectToSearch("", k)}}
            onLinkOptionToSelection={onLinkOptionToSelection}
            />
      ))}
    </div>
  );
}

export default SearchPromoPage


