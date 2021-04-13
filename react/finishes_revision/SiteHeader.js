import React from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';

import FocusEditableInput from '../components/FocusEditableInput';

const SiteHeader = ({ projectName }) => {
  const renderingsLink = window.hasOwnProperty("RENDERINGS_LINK") ? RENDERINGS_LINK : "";
  const projectId = useSelector(state => state.projectId)
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  
  const changeProjectName = (newName) => {
    if (newName && newName !== projectName) ActionCreators.changeProjectName(projectId, newName);
  }
  
  return (
    <div className="xlarge-container">
      <h1 style={{ display: "inline-block" }}>
        <FocusEditableInput
          editable={adminMode}
          value={projectName}
          onUpdate={changeProjectName}
        />
      </h1>
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
