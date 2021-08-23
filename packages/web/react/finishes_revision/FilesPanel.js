import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Icon, Table, Grid, Header } from 'semantic-ui-react';

import NewPlanModal from './modals/NewPlanModal';

import styles from "./FilesPanel.module.css";


const FilesPanel = (props) => {
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  const projectDocUrl = useSelector(state => state.projectDocUrl); //TODO: where to migrate this data?
  const plans = useSelector(state => state.plans);
  console.log({plans})

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  // const [loading, setLoading] = useState(false);
  const toggleNewPlanModal = () => setShowNewPlanModal(!showNewPlanModal);
  
  const fakeNames = ['Project Cover', 'Name A', 'Name B', 'Name C', 'Name D']
  const fakeDocs = new Array(9).fill({ url: projectDocUrl, createdAt: Date.now() })
  return (
    <>
      <section className="xlarge-container">
        <a href={`/api2/v2/plans/${PROJECT_ACCESS_TOKEN}`}>hit me</a>
        <div className={`${styles.documentLinkContainer} no-print`}>
          <Button
            icon
            labelPosition='right'
            color="green"
            size="tiny"
            onClick={toggleNewPlanModal}
          >
            Add New
            <Icon name='plus' />
          </Button>
        </div>
        <Grid>
          <Grid.Column width={8}>
            <Header as='h2'>Project Documents</Header>
          </Grid.Column>
        </Grid>
        <Table className="celled">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={1}>#</Table.HeaderCell>
              <Table.HeaderCell width={4}>Document Name</Table.HeaderCell>
              <Table.HeaderCell width={4}>Date Added</Table.HeaderCell>
              <Table.HeaderCell>Download File</Table.HeaderCell>
              <Table.HeaderCell>History</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fakeDocs.map(({ url, createdAt }, i) => (
              <tr className="project-row" key={i}>
                <td>
                    <span>{i + 1}</span>
                </td>
                <td>
                    <span>{fakeNames[i] || 'Some Name'}</span>
                </td>
                <td>
                    <span>{new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString()}</span>
                </td>
                <td>
                    <a target="_blank" href={url}>{fakeNames[i] || 'Some Name'}</a>
                </td>
                <td>
                    <a onClick={() => alert('wip')}>History</a>
                </td>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </section>
      {showNewPlanModal && <NewPlanModal onClose={toggleNewPlanModal} />}
    </>
  );
}

export default FilesPanel;
