import React, { useState } from 'react';
import _ from 'underscore';
import { useSelector } from 'react-redux';
import { Button, Icon, Header, Grid, Dimmer, Loader, } from 'semantic-ui-react';
import ActionCreators from './action_creators';


import { ActivePlansTable, ArchivedPlansTable } from './FilePanelTables';
import EditPlanModal from './modals/EditPlanModal';
import PlanHistoryModal from './modals/PlanHistoryModal';

import styles from "./FilePanel.module.css";


const FilePanel = () => {
  const adminMode = IS_SUPER_ADMIN;
  // const projectDocUrl = useSelector(state => state.projectDocUrl); //TODO: write script to migrate to Document/Plan
  const plans = useSelector(state => state.plans) || [];
  const activePlans = _.sortBy(plans.filter(p => !p.archived), 'order');
  const archivedPlans = plans.filter(p => !!p.archived);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanHistory, setShowPlanHistory] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  const handleReorderPlans = ({ planId, newOrderNum }) => {
    if (loading) return;
    setLoading(true);
    const onSuccess = () => setLoading(false);
    const onError = () => setLoading(false);

    ActionCreators.reorderPlan(planId, newOrderNum, onSuccess, onError);
  }

  const editPlanName = (planId, name) => {
    if (loading) return;
    setLoading(true);
    const onSuccess = () => setLoading(false);
    const onError = () => setLoading(false);
    
    ActionCreators.updatePlan(planId, { name }, onSuccess, onError);
  }


  return (
    <>
      <section className="xlarge-container">
        <Grid>
          <Grid.Column width={8}>
            <Header as='h2'>Project Documents</Header>
          </Grid.Column>
        </Grid>
        <ActivePlansTable
          plans={activePlans}
          handleReorderPlans={handleReorderPlans}
          toggleArchivePlan={toggleArchivePlan}
          setEditPlan={setEditPlan}
          handleEditPlanName={editPlanName}
          setShowHistory={setSelectedPlanHistory}
        />
        <Grid style={{ marginTop: 20 }}>
          <Grid.Column width={8}>
            <Header as='h2'>Archived Documents</Header>
          </Grid.Column>
        </Grid>
        <ArchivedPlansTable
          plans={archivedPlans}
          toggleArchivePlan={toggleArchivePlan}
          setShowHistory={setSelectedPlanHistory}
        />
        {loading && <Dimmer active inverted><Loader /></Dimmer>}
      </section>
      {showEditPlanModal && <EditPlanModal onClose={closeEditPlan} plan={selectedPlan} />}
      {showPlanHistoryModal && <PlanHistoryModal onClose={closePlanHistory} plan={selectedPlan} />}
    </>
  );
}

export default FilePanel;
