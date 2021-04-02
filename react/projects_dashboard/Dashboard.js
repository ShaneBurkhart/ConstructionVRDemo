import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';

import { Grid, Table, Header, Button, Icon } from "semantic-ui-react";

import ToastMessage from '../components/ToastMessage';
import CreateProjectModal from './CreateProjectModal';
import CopyProjectModal from './CopyProjectModal';
import ConfirmModal from './ConfirmModal';

// TO DO - Inside of app, clicking between headers has hardcoded href /finishes, will send to v2 of app when clicked
// where to control for this? Local? session flag? See "Pine Lawn Dental"

// TO DO - handle state re: last_seen_at, updates quicker than redirect



const Dashboard = () => {
  const allProjects = useSelector(state => state.projects || []);
  const isAdmin = IS_SUPER_ADMIN;

  const [message, setMessage] = useState({ show: false });
  const [projectToCopy, setProjectToCopy] = useState({});
  const [confirmProject, setConfirmProject] = useState({});
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCopyProjectModal, setShowCopyProjectModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleShowCreateProjectModal = () => setShowCreateProjectModal(!showCreateProjectModal);
  const toggleShowCopyProjectModal = () => setShowCopyProjectModal(!showCopyProjectModal);
  const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

  const onSuccess = (result) => setMessage({ show: true, message: result.message, positive: true });
  const onError = (result) => setMessage({ show: true, message: result.message, positive: false });

  const handleCreateNew = (name) => ActionCreators.addNewProject(name, onSuccess, onError); 
  const handleCopy = (newName) => ActionCreators.copyProject({ name: newName, id: projectToCopy.id }, onSuccess, onError);
  const handleToggleArchive = () => ActionCreators.toggleArchiveProject(confirmProject.id, onSuccess, onError);
  
  const openCopyModal = (id, name)=> {
    setProjectToCopy({id, name});
    toggleShowCopyProjectModal();
  }

  const openConfirmModal = (id, name, type) => {
    const modalMessage = type === "archive" ? `Archive '${name}'?` : `Reactivate '${name}'?`

    setConfirmModalMessage(modalMessage);
    setConfirmProject({id, name});
    toggleShowConfirmModal();
  }

  const updateSeenAt = (id) => ActionCreators.updateSeenAt(id)
  
  const filterProjects = (filter) => {
    switch (filter) {
      case 'recent':
        return allProjects
          .filter(p => !p.archived && p.last_seen_at)
          .sort((a,b) => a.last_seen_at > b.last_seen_at ? -1 : 1)
          .slice(0,5)
      case 'active':
        return allProjects.filter(p => !p.archived).sort((a,b) => a.name > b.name ? 1 : -1);
      case 'archived':
        return allProjects.filter(p => p.archived).sort((a,b) => a.name > b.name ? 1 : -1);
      default:
        return allProjects
    }
  }

  const getHref = (adminAccessToken, generalAccessToken, isV1) => {
    if (isAdmin && isV1) return `/admin/login/${adminAccessToken}`;
    if (isAdmin && !isV1) return `/admin/login/v2/${adminAccessToken}`;
    if (isV1) return `/project/${generalAccessToken}/finishes/v1`;
    return `/project/${generalAccessToken}/finishes`;
  }

  const ProjectGrid = ({ title, projectList, archived=false }) => {
    return (
      <>
        <Grid>
          <Grid.Column width={8}>
              <Header as='h2'>{title}</Header>
          </Grid.Column>
        </Grid>
        <Table className="celled">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={10}>Project</Table.HeaderCell>
              <Table.HeaderCell>Controls</Table.HeaderCell>
              <Table.HeaderCell width={1}>V1</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projectList.map(({ id, accessToken, href, name, v1 }) => {
              const linkHref = getHref(href, accessToken, v1);
              return (
                <tr className="project-row" key={accessToken}>
                  <td>
                      <a href={linkHref} onClick={() => updateSeenAt(id)}>{name}</a>
                  </td>
                  {isAdmin && !archived &&  (
                    <td> 
                      <a className="project-controls-link" onClick={() => openCopyModal(id, name)}>Copy</a>
                      <a className="project-controls-link" onClick={() => openConfirmModal(id, name, 'archive')}>Archive</a>
                    </td>
                  )}
                  {isAdmin && !!archived && (
                    <td> 
                      <a className="project-controls-link" onClick={() => openConfirmModal(id, name, 'reactivate')}>Re-Activate</a>
                    </td>
                  )}
                  <td>
                      {v1 && <Icon name="check" color="grey" />}
                  </td>
                </tr>
            )})}
          </Table.Body>
        </Table>
      </>
    )
  }

  return (
    <section style={{ position: 'relative' }}>
      {isAdmin && <Button onClick={toggleShowCreateProjectModal} className="dashboard-create-btn">Create New Project</Button>}
      <div className="ui grid centered">
        <div className="column">
          <ProjectGrid
            title={"Recently Viewed Projects"}
            projectList={filterProjects('recent')}
          />
          <ProjectGrid
            title={"Active Projects"}
            projectList={filterProjects('active')}
          />
          <ProjectGrid
            title={"Archived Projects"}
            projectList={filterProjects('archived')}
            archived={true}
          />
        </div>

        {showCreateProjectModal && <CreateProjectModal onSubmit={handleCreateNew} onClose={toggleShowCreateProjectModal} />}
        {showCopyProjectModal && (
          <CopyProjectModal
            onSubmit={handleCopy}
            projectToCopy={projectToCopy}
            setProjectToCopy={setProjectToCopy}
            onClose={toggleShowCopyProjectModal}
          />
        )}
        {showConfirmModal && (
          <ConfirmModal
            onSubmit={handleToggleArchive}
            project={confirmProject}
            modalMessage={confirmModalMessage}
            setConfirmProject={setConfirmProject}
            onClose={toggleShowConfirmModal}
          />
        )}
      </div>
      <ToastMessage message={message.message} positive={message.positive} />
    </section>
  );
}

export default Dashboard;
