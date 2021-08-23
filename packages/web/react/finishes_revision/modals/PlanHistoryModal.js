import React, { useState } from 'react';
import { Modal, Button, Loader, Dimmer, Icon } from 'semantic-ui-react';

import './NewPlanModal.css';


const PlanHistoryModal = ({ onClose, plan }) => {
  const planHistory = plan.PlanHistories || [];
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      closeIcon
      open={true}
      onClose={onClose}
      closeOnDimmerClick={false}
      className="newPlanModal"
      size="small"
    >
      <Modal.Header>
        {plan.name}
      </Modal.Header>
      <Modal.Content>
        {planHistory.map(p => (
          <div key={p.id} className="row" style={{ marginBottom: 15 }}>
            <div className="col-sm-8" style={{ wordWrap: "break-word" }}>
              {p.url && (
                <a
                  href={p.url}
                  title={p.filename || p.url}
                  target="_blank"
                >
                  <Icon name="arrow circle down"/>
                  {p.filename || p.url}
                </a>
              )}
            </div>
            <div className="col-sm-4" style={{ paddingLeft: 30 }}>
              <div>uploaded {new Date(p.uploadedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Close
        </Button>
      </Modal.Actions>
      {loading && <Dimmer active inverted><Loader /></Dimmer>}
    </Modal>
  );
}

export default PlanHistoryModal;
