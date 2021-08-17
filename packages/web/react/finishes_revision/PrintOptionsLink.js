import React, { useState } from 'react';
import PrintOptionsModal from './modals/PrintOptionsModal';

const PrintOptionsLink  = ({ categoryList }) => {
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const toggleShowPrintOptionsModal = () => setShowPrintOptionsModal(!showPrintOptionsModal);

  const onSubmitPrintOptions = () => {
    setShowPrintOptionsModal(false);
    setTimeout(() => window.print(), 0);
  }
  
  return (
    <div className={`hide-print`}>
      <div>
        <div>
          <a style={{ cursor: "pointer" }} onClick={toggleShowPrintOptionsModal}>Print Options</a>
        </div>
      </div>
      {showPrintOptionsModal && (
        <PrintOptionsModal onClose={toggleShowPrintOptionsModal} categoryList={categoryList} onSubmit={onSubmitPrintOptions} />
      )}
    </div>
  );
}

export default PrintOptionsLink;

