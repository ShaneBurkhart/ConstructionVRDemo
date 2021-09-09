import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';
import { SearchIcon } from '@heroicons/react/outline';

import { Grid, Table, Header, Button, Icon } from "semantic-ui-react";

import ToastMessage from '../components/ToastMessage';
import CreateProjectModal from './CreateProjectModal';
import CopyProjectModal from './CopyProjectModal';
import ConfirmModal from './ConfirmModal';

const CustomInputWrapper = ({ children }) => (
  <div className="relative flex items-center p-1 px-2 py-0 mt-2 leading-6 border border-gray-400 rounded xs:mt-0 max-w-max focus-within:ring-blue-600 focus-within:ring-1 focus-within:ring-offset-0 focus-within:border-blue-600 focus-within:ring-offset-white">
    {children}
  </div>
);


const Dashboard = () => {
  const allProjects = useSelector(state => state.projects || []);
  const isAdmin = IS_SUPER_ADMIN || IS_EDITOR;

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

  const ProjectGrid = ({ title, projects, archived=false, search=false, className='' }) => {
    const [searchQuery, setSearchQuery] = useState('');

    let filteredProjects = [...(projects || [])];
    const q = searchQuery.trim().toLowerCase();
    if (!!q) {
      filteredProjects = projects.filter(p => p.name.toLowerCase().includes(q) || (p.Document || {}).filename?.toLowerCase().includes(q));
    }

    return (
      <div className={className}>
        <Grid stackable>
          <Grid.Column width={12}>
            <Header as='h2'>{title}</Header>
          </Grid.Column>
          {search && (
            <Grid.Column width={4}>
              <CustomInputWrapper>
                <input 
                  onChange={e => setSearchQuery(e.target.value)} 
                  style={{ width: 230 }}
                  className="leading-5 text-black placeholder-gray-400 bg-transparent border-none focus:border-none focus:ring-0 focus:ring-offset-0"
                  type="search" 
                  name="search" 
                  placeholder="Search projects"
                /> 
                <SearchIcon className="w-4 h-4 text-gray-400" />
              </CustomInputWrapper>
            </Grid.Column>
          )}
        </Grid>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={10}>Project</Table.HeaderCell>
              <Table.HeaderCell>Controls</Table.HeaderCell>
              <Table.HeaderCell width={1}>V1</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredProjects.map(({ id, accessToken, name, v1 }) => (
                <tr className="project-row" key={accessToken}>
                  <td>
                      <a href={`/app/project/${accessToken}/finishes`} onClick={() => updateSeenAt(id)}>{name}</a>
                  </td>
                  {isAdmin && !archived &&  (
                    <td> 
                      <a className="mr-4 text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openCopyModal(id, name)}>Copy</a>
                      <a className="text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openConfirmModal(id, name, 'archive')}>Archive</a>
                    </td>
                  )}
                  {isAdmin && !!archived && (
                    <td> 
                      <a className="text-blue-600 cursor-pointer project-controls hover:text-blue-800" onClick={() => openConfirmModal(id, name, 'reactivate')}>Re-Activate</a>
                    </td>
                  )}
                  <td>
                    {v1 && <Icon name="check" color="grey" />}
                  </td>
                </tr>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }

  return (
    <section>
      {isAdmin && (
        <div className="flex justify-end w-full my-2">
          <Button onClick={toggleShowCreateProjectModal}>
            Create New Project
          </Button>
        </div>
      )}
      <div className="grid ui centered">
        <div className="column">
          <ProjectGrid
            title={"Recently Viewed Projects"}
            projects={filterProjects('recent')}
            className="mt-6"
          />
          <ProjectGrid
            title={"Active Projects"}
            projects={filterProjects('active')}
            search
            className="mt-12"
          />
          <ProjectGrid
            title={"Archived Projects"}
            projects={filterProjects('archived')}
            archived
            className="mt-12"
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
