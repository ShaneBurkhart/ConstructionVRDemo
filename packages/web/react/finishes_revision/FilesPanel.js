import React, { useState } from 'react';
import _ from 'underscore';
import { useSelector } from 'react-redux';
import { Button, Icon, Table, Grid, Header } from 'semantic-ui-react';
import ActionCreators from './action_creators';


import NewPlanModal from './modals/NewPlanModal';
import EditPlanModal from './modals/EditPlanModal';
import PlanHistoryModal from './modals/PlanHistoryModal';

import styles from "./FilesPanel.module.css";


const FilesPanel = (props) => {
  // const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  // const projectDocUrl = useSelector(state => state.projectDocUrl); //TODO: where to migrate this data?
  const plans = useSelector(state => state.plans) || [];
  const activePlans = _.sortBy(plans.filter(p => !p.archived), 'order');
  const archivedPlans = plans.filter(p => !!p.archived);

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanHistory, setShowPlanHistory] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const toggleNewPlanModal = () => setShowNewPlanModal(!showNewPlanModal);
  const showPlanHistoryModal = !!selectedPlan && showPlanHistory;
  const showEditPlanModal = !!selectedPlan && showEditPlan;

  const setSelectedPlanHistory = (plan) => {
    setSelectedPlan(plan);
    setShowPlanHistory(true);
  }

  const closePlanHistory = () => {
    setSelectedPlan(null);
    setShowPlanHistory(false);
  }

  const setEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowEditPlan(true);
  }

  const closeEditPlan = () => {
    setSelectedPlan(null);
    setShowEditPlan(false);
  }

  const toggleArchivePlan = planId => {
    if (loading) return;
    setLoading(true);
    const onSuccess = () => setLoading(false);
    const onError = () => setLoading(false);
    
    ActionCreators.toggleArchivePlan(planId, onSuccess, onError);
  }
  
  return (
    <>
      <section className="xlarge-container">
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
              <Table.HeaderCell>Controls</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(activePlans || []).map((p, i) => (
              <tr className="project-row" key={p.id}>
                <td>
                    <span>{p.order + 1}</span>
                </td>
                <td className={styles.truncateCell}>
                    <span>{p.name || p.filename}</span>
                </td>
                <td>
                    <span>{new Date(p.updatedAt).toLocaleDateString()} {new Date(p.updatedAt).toLocaleTimeString()}</span>
                </td>
                <td className={styles.truncateCell}>
                    <a target="_blank" href={p.url}>{p.filename || 'link'}</a>
                </td>
                <td>
                    <span style={{ marginLeft: 5 }}><a onClick={() => setEditPlan(p)}>Edit</a></span>
                    <span style={{ marginLeft: 5 }}><a onClick={() => toggleArchivePlan(p.id)}>Archive</a></span>
                    {!!(p.PlanHistories || []).length && <span style={{ marginLeft: 5 }}><a onClick={() => setSelectedPlanHistory(p)}>Details</a></span>}
                </td>
              </tr>
            ))}
            {!(activePlans || []).length && <tr><td style={{ whiteSpace: 'nowrap' }}>No documents</td></tr>}
          </Table.Body>
        </Table>
        <Grid>
          <Grid.Column width={8}>
            <Header as='h2'>Archived Documents</Header>
          </Grid.Column>
        </Grid>
        <Table className="celled">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={4}>Name</Table.HeaderCell>
              <Table.HeaderCell width={4}>Updated At</Table.HeaderCell>
              <Table.HeaderCell>Download File</Table.HeaderCell>
              <Table.HeaderCell>History</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(archivedPlans || []).map((p, i) => (
              <tr className="project-row" key={p.id}>
                <td className={styles.truncateCell}>
                    <span>{p.name || p.filename}</span>
                </td>
                <td>
                    <span>{new Date(p.updatedAt).toLocaleDateString()} {new Date(p.updatedAt).toLocaleTimeString()}</span>
                </td>
                <td className={styles.truncateCell}>
                    <a target="_blank" href={p.url}>{p.filename || 'link'}</a>
                </td>
                <td>
                    <span style={{ marginLeft: 5 }}><a onClick={() => toggleArchivePlan(p.id)}>Re-activate</a></span>
                    {!!(p.PlanHistories || []).length && <span style={{ marginLeft: 5 }}><a onClick={() => setSelectedPlanHistory(p)}>Details</a></span>}
                </td>
              </tr>
            ))}
            {!(archivedPlans || []).length && <tr><td style={{ whiteSpace: 'nowrap' }}>No archived documents</td></tr>}
          </Table.Body>
        </Table>
      </section>
      {showNewPlanModal && <NewPlanModal onClose={toggleNewPlanModal} />}
      {showEditPlanModal && <EditPlanModal onClose={closeEditPlan} plan={selectedPlan} />}
      {showPlanHistoryModal && <PlanHistoryModal onClose={closePlanHistory} plan={selectedPlan} />}
    </>
  );
}

export default FilesPanel;
