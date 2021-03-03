import React from 'react';
import { Dropdown, Label, Form, Input, Button, Table, Grid, Header } from "semantic-ui-react";

const Dashboard = () => {
  const allProjects = PROJECTS;

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
              <tr className="project-row" key={project['Record ID']}>
                <td>
                  <a href={`/admin/login/${project["Admin Access Token"]}`}>{project['Name']}</a>
                </td>
                <td>
                  <a>Copy</a>
                </td>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default Dashboard;
