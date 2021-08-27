import React from 'react';
import { Modal, Button, Header } from 'semantic-ui-react';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';

import './NewPlanModal.css';

const dateOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "numeric",
}


const PlanHistoryModal = ({ onClose, plan }) => {
  const planHistory = plan.PlanHistories || [];

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
        {plan.name} <span className="ml-1">History</span>
      </Modal.Header>
      <Modal.Content>
        <Header as="h5">Previously uploaded versions:</Header>
        <ul role="list" className="relative z-0 divide-y divide-gray-200">
          {planHistory.filter(p => !!p.Document).map(p => {
            const doc = p.Document;
            return (
              <li key={doc.uuid} className="bg-white">
                <div className="relative flex items-center px-4 py-2 space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                  <div className="flex-shrink-0">
                    <ArrowCircleDownIcon className="w-5 h-5 text-blue-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={`/app/document/${doc.uuid}`} title={`open ${doc.filename} in viewer`} className="focus:outline-none" target="_blank">
                      {/* Extend touch target to entire panel */}
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{doc.filename || doc.s3Url}</p>
                      <p className="text-sm text-gray-500 truncate">uploaded {new Date(p.uploadedAt).toLocaleDateString('en', dateOptions)}</p>
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default PlanHistoryModal;
