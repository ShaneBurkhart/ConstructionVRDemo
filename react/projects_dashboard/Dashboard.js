import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';

import { Grid, Table, Header, Button, Label } from "semantic-ui-react";

import CreateProjectModal from './CreateProjectModal';
import CopyProjectModal from './CopyProjectModal';

const Dashboard = () => {
  const allProjects = useSelector(state => state.projects || []);
  const isAdmin = IS_SUPER_ADMIN;

  const [message, setMessage] = useState({ show: false });
  const [projectToCopy, setProjectToCopy] = useState({});
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCopyProjectModal, setShowCopyProjectModal] = useState(false);

  const toggleShowCreateProjectModal = () => setShowCreateProjectModal(!showCreateProjectModal);
  const toggleShowCopyProjectModal = () => setShowCopyProjectModal(!showCopyProjectModal);

  useEffect(() => {
    if (message.show) {
      setTimeout(() => setMessage({ show: false }), 2000)
    }
  }, [message]);

  const onSuccess = (result) => setMessage({ show: true, message: result.message, color: 'green' });
  const onError = (result) => setMessage({ show: true, message: result.message, color: 'red' });

  const handleCreateNew = (name) => ActionCreators.addNewProject(name, onSuccess, onError); 
  const handleCopy = (newName) => ActionCreators.copyProject({ name: newName, id: projectToCopy.id }, onSuccess, onError)
  
  const openCopyModal = (id, name)=> {
    setProjectToCopy({id, name});
    toggleShowCopyProjectModal();
  }

  return (
    <div className="ui grid centered">
      <div className="column">
        <Grid>
          <Grid.Column width={8}>
              <Header as='h2'>All Projects</Header>
          </Grid.Column>
          <Grid.Column width={4}>
              {message.show && <Label basic color={message.color}>{message.message}</Label>}
          </Grid.Column>
          <Grid.Column width={4}>
              {isAdmin && <Button onClick={toggleShowCreateProjectModal}>Create New Project</Button>}
          </Grid.Column>
        </Grid>
        <Table className="celled">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Project</Table.HeaderCell>
              <Table.HeaderCell>Controls</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {allProjects.map(project => (
                <tr className="project-row" key={project.accessToken}>
                  <td>
                    {isAdmin ? (
                      <a href={`/admin/login/${project.adminAccessToken}`}>{project.name}</a>
                    ) : (
                      <a href={`/project/${project.accessToken}/finishes`}>{project.name}</a>
                    )}
                  </td>
                  {isAdmin &&  <td> <a className="project-copy-link" onClick={() => openCopyModal(project.id, project.name)}>Copy</a> </td>}
                </tr>
            ))}
          </Table.Body>
        </Table>
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
    </div>
  );
}

export default Dashboard;
