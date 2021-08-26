import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Icon, Button } from 'semantic-ui-react';

import ActionCreators from './action_creators';

import FocusEditableInput from '../components/FocusEditableInput';
import ProjectDocumentModal from './modals/ProjectDocumentModal';

import styles from './SiteHeader.module.css';

const SiteHeader = ({ adminMode, toggleShareLinkModal, togglePrintOptionsModal }) => {
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
        <div className={styles.headerContent}>
          <h1>
            <FocusEditableInput
              editable={adminMode}
              value={projectName}
              onUpdate={changeProjectName}
            />
          </h1>
          <div className="flex items-center no-print">
            <div className={styles.documentLinkContainer}>
              {projectDocUrl && (
                <>
                  <a href={projectDocUrl} target="_blank" title="open the documents" style={{ cursor: 'pointer' }}>
                    Construction Documents
                  </a>
                  {adminMode && (
                    <a onClick={toggleShowProjectDocModal} title="edit documents" className={styles.editCurrentIcon}>
                      <Icon name="cloud upload" />
                    </a>
                  )}
                </>
              )}
              {!projectDocUrl && adminMode && (
                <a onClick={toggleShowProjectDocModal} title="click to add documents" style={{ cursor: 'pointer', display: 'flex', width: '100%' }}>
                  <span style={{ marginRight: '5%' }}>Upload document</span>
                  <Icon name="cloud upload" />
                </a>
              )}
            </div>
            <Button
              icon={<Icon name="print" style={{ fontSize: '1rem' }} />}
              size="tiny"
              onClick={togglePrintOptionsModal}
              title="Open print options"
            />
          {adminMode && (
              <Button 
                size="tiny" 
                color="blue" 
                onClick={toggleShareLinkModal} 
                title="edit documents" 
              >
                Share
              </Button>
            )}
          </div>
        </div>

        <div className="ui tabular menu hide-print">
          <NavLink exact to={`/app/project/${PROJECT_ACCESS_TOKEN}/finishes`} className="item" activeClassName="active">
            Finish Selections
          </NavLink>
          <NavLink to={`/app/project/${PROJECT_ACCESS_TOKEN}/finishes/files`} className="item" activeClassName="active">
            Files
          </NavLink>
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
