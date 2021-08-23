import React, { useState } from 'react';
import _ from 'underscore';
import { useSelector } from 'react-redux';
import { Button, Icon, Table, Grid, Header } from 'semantic-ui-react';

import NewPlanModal from './modals/NewPlanModal';

import styles from "./FilesPanel.module.css";


const FilesPanel = (props) => {
  // const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  // const projectDocUrl = useSelector(state => state.projectDocUrl); //TODO: where to migrate this data?
  let plans = useSelector(state => state.plans) || [];
  plans = _.sortBy(plans, 'order');

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  // const [loading, setLoading] = useState(false);
  const toggleNewPlanModal = () => setShowNewPlanModal(!showNewPlanModal);
  
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
              <Table.HeaderCell width={4}>Name</Table.HeaderCell>
              <Table.HeaderCell width={4}>Updated At</Table.HeaderCell>
              <Table.HeaderCell>Download File</Table.HeaderCell>
              <Table.HeaderCell>History</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(plans || []).map((p, i) => (
              <tr className="project-row" key={p.id}>
                <td>
                    <span>{p.order + 1}</span>
                </td>
                <td>
                    <span>{p.name || p.filename}</span>
                </td>
                <td>
                    <span>{new Date(p.updatedAt).toLocaleDateString()} {new Date(p.updatedAt).toLocaleTimeString()}</span>
                </td>
                <td>
                    <a target="_blank" href={p.url}>{p.filename || 'link'}</a>
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
