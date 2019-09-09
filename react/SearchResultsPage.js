import React from 'react';

import { Popup, Label } from 'semantic-ui-react'

import SearchThumbnailSection from './SearchThumbnailSection'

function SearchResultsPage(props) {
  const {
    isAdmin, header, searchResults, selection, resultsToShow, onLinkOptionToSelection,
  } = props;
  const { query, category, userLibrary, finishVisionLibrary } = searchResults;

  return (
    <div className="search-results-section">
      <div>
        <Label>Search: "{query}"</Label>
        <Label>Category: {category}</Label>
      </div>
      <SearchThumbnailSection
        isAdmin={isAdmin}
        header={"Your Library"}
        options={userLibrary}
        selection={selection}
        onLinkOptionToSelection={onLinkOptionToSelection}
        />
      <hr/>
      <SearchThumbnailSection
        grid
        isAdmin={isAdmin}
        header={"FinishVision Library"}
        options={finishVisionLibrary}
        selection={selection}
        onLinkOptionToSelection={onLinkOptionToSelection}
        />
    </div>
  );
}

export default SearchResultsPage


