import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';

import { Grid, Table, Header, Button, Message } from "semantic-ui-react";

import CreateProjectModal from './CreateProjectModal';
import CopyProjectModal from './CopyProjectModal';
import ConfirmModal from './ConfirmModal';

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

  useEffect(() => {
    if (message.show) {
      setTimeout(() => setMessage({ show: false }), 3000)
    }
  }, [message]);

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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projectList.map(({ id, accessToken, href, name}) => {
              const link = isAdmin ? `/admin/login/${href}` : `/project/${accessToken}/finishes`
              return (
                <tr className="project-row" key={accessToken}>
                  <td>
                      <a href={link} onClick={() => updateSeenAt(id)}>{name}</a>
                  </td>
                  {isAdmin && !archived  (
                    <td> 
                      <a className="project-controls-link" onClick={() => openCopyModal(id, name)}>Copy</a>
                      <a className="project-controls-link" onClick={() => openConfirmModal(id, name, 'archive')}>Archive</a>
                    </td>
                  )}
                  {isAdmin && archived  (
                    <td> 
                      <a className="project-controls-link" onClick={() => openConfirmModal(id, name, 'reactivate')}>Re-Activate</a>
                    </td>
                  )}
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
      {message.show && (
        <Message 
          size="big"
          style={{ 
            position: 'fixed',
            bottom: 5,
            right: 5,
            backgroundColor: message.positive ? '#12c712c7' : '#ff2d2dc7',
            color: 'white' 
          }}
        >
          {message.message}
        </Message>
      )}
    </section>
  );
}

export default Dashboard;
