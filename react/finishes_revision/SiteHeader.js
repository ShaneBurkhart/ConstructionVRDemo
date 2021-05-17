import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import ProjectDocumentModal from './modals/ProjectDocumentModal';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './SiteHeader.module.css';

const SiteHeader = ({ adminMode }) => {
  const renderingsLink = window.hasOwnProperty("RENDERINGS_LINK") ? RENDERINGS_LINK : "";
  
  const projectId = useSelector(state => state.projectId);
  const projectName = useSelector(state => state.projectName);
  const projectDocUrl = useSelector(state => state.projectDocUrl);

  const [showProjectDocModal, setShowProjectDocModal] = useState(false);
  const toggleShowProjectDocModal = () => setShowProjectDocModal(!showProjectDocModal);
  
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
          {adminMode && (
            <div className={`${styles.documentLinkContainer} no-print`}>
              {projectDocUrl && (
                <>
                  <a href={projectDocUrl} target="_blank" title="open the documents" style={{ cursor: 'pointer' }}>
                    Construction Documents
                  </a>
                  <a onClick={toggleShowProjectDocModal} title="edit documents" className={styles.editCurrentIcon}>
                    <Icon name="cloud upload" />
                  </a>
                </>
              )}
              {!projectDocUrl && (
                <a onClick={toggleShowProjectDocModal} title="click to add documents" style={{ cursor: 'pointer', display: 'flex', width: '100%' }}>
                  <span style={{ marginRight: '5%' }}>Upload document</span>
                  <Icon name="cloud upload" />
                </a>
              )}
            </div>
          )}
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
