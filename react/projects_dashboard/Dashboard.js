import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ActionCreators from './action_creators';

import { Grid, Table, Header, Button, Label } from "semantic-ui-react";

const Dashboard = () => {
  const allProjects = useSelector(state => state.projects || []);
  const isAdmin = IS_SUPER_ADMIN;

  const [message, setMessage] = useState({ show: false })

  useEffect(() => {
    if (message.show) {
      setTimeout(() => setMessage({ show: false }), 2000)
    }
  }, [message])

  const onSuccess = (result) => setMessage({ show: true, message: result.message, color: 'green' });
  const onError = (result) => setMessage({ show: true, message: result.message, color: 'red' });

  const handleCreateNew = () => {
    const name = prompt("Give your project a name");
    ActionCreators.addNewProject(name, onSuccess, onError); 
  }

  const handleCopy = (id) => {
    const name = prompt("Enter a new name for copied project");
    ActionCreators.copyProject({ name, id }, onSuccess, onError)
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
              {isAdmin && <Button onClick={handleCreateNew}>Create New Project</Button>}
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
                  {isAdmin &&  <td> <a onClick={() => handleCopy(project.id)}>Copy</a> </td>}
                </tr>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default Dashboard;
