import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import ProjectDocumentModal from './modals/ProjectDocumentModal';
import FocusEditableInput from '../components/FocusEditableInput';

const SiteHeader = ({ adminMode }) => {
  const renderingsLink = window.hasOwnProperty("RENDERINGS_LINK") ? RENDERINGS_LINK : "";
  
  const projectId = useSelector(state => state.projectId);
  const projectName = useSelector(state => state.projectName);
  const projectDocUrl = useSelector(state => state.projectDocUrl);

  const [showProjectDocModal, setShowProjectDocModal] = useState(false);
  const [showProjectDocEditIcon, setShowProjectDocEditIcon] = useState(false);
  
  const toggleShowProjectDocModal = () => setShowProjectDocModal(!showProjectDocModal);
  const toggleShowProjectDocEditIcon = () => setShowProjectDocEditIcon(!showProjectDocEditIcon);
  
  const changeProjectName = (newName) => {
    if (newName && newName !== projectName) ActionCreators.changeProjectName(projectId, newName);
  }
  
  return (
    <>
      <div className="xlarge-container">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ display: "inline-block" }}>
            <FocusEditableInput
              editable={adminMode}
              value={projectName}
              onUpdate={changeProjectName}
            />
          </h1>
          <div style={{ marginLeft: '5%' }}>
            {projectDocUrl && (
              <>
                <a href={projectDocUrl} style={{ cursor: 'pointer' }} onMouseEnter={toggleShowProjectDocEditIcon} onMouseLeave={toggleShowProjectDocEditIcon}>
                  Construction Documents
                </a>
                {showProjectDocEditIcon && (
                  <a onClick={toggleShowProjectDocModal} style={{ marginLeft: '1%', cursor: 'pointer' }}>
                    <Icon name="upload" /> Upload a construction document
                  </a>
                )}
              </>
            )}
            {!projectDocUrl && (
              <a onClick={toggleShowProjectDocModal} style={{ marginLeft: '1%', cursor: 'pointer' }}>
                <Icon name="upload" /> Upload a construction document
              </a>
            )}
          </div>
        </div>
        <div className="ui tabular menu hide-print">
          <a className="item active">Finish Selections</a>
          {renderingsLink && (
            <a href={renderingsLink} className="item">Renderings</a>
          )}
        </div>
      </div>
      {showProjectDocModal && <ProjectDocumentModal onClose={toggleShowProjectDocModal} docUrl={projectDocUrl} />}
    </>
  )
}

export default SiteHeader;
