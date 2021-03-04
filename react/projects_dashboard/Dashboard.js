import React from 'react';
import { useSelector } from 'react-redux';

import { Table, Header } from "semantic-ui-react";

const Dashboard = () => {
  const allProjects = useSelector(state => state.projects || []);
  const isAdmin = window.hasOwnProperty('IS_SUPER_ADMIN') && IS_SUPER_ADMIN;

  return (
    <div className="ui grid centered">
      <div className="column">
        <div className="ui row" style={{ marginBottom: 10 }}>
          <Header as='h2'>All Projects</Header>
        </div>
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
                  {isAdmin ? (
                    <>
                      <td>
                        <a href={`/admin/login/${project.adminAccessToken}`}>{project.name}</a>
                      </td>
                      <td>
                        <a>Copy</a>
                      </td>
                    </>
                  ) : (
                    <td>
                      <a href={`/project/${project.accessToken}/finishes`}>{project.name}</a>
                    </td>
                  )}
                </tr>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default Dashboard;
