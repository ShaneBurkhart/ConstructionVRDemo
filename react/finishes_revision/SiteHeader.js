import React from 'react';

import FocusEditableInput from '../components/FocusEditableInput';

const SiteHeader = ({ projectName }) => {
  const renderingsLink = window.hasOwnProperty("RENDERINGS_LINK") ? RENDERINGS_LINK : "";
  return (
    <div className="xlarge-container">
      <h1>{projectName}</h1>
      <div className="ui tabular menu hide-print">
        <a className="item active">Finish Selections</a>
        {renderingsLink && (
          <a href={renderingsLink} className="item">Renderings</a>
        )}
      </div>
    </div>
  )
}

export default SiteHeader;
