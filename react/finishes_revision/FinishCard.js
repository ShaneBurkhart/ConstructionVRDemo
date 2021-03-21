import React, { useState, useEffect } from 'react';

import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from './FinishCard.module.css';

const FinishCard = ({ tag, finishDetails, shouldExpand }) => {
  const { orderNumber, attributes } = finishDetails;
  const [expanded, setExpanded] = useState(shouldExpand.status);
  const [showEditFinishModal, setShowEditFinishModal] = useState(false);

  useEffect(() => {
    setExpanded(shouldExpand.status);
  }, [shouldExpand.clicked]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded)
  };

  const toggleShowEditFinishModal = () => setShowEditFinishModal(!showEditFinishModal);

  const imgArr = attributes["Images"] || [];
  return (
    <>
      <div className={`table-row ${styles.finishCard}`} onClick={toggleShowEditFinishModal}>
        <div className="details-section">
          <span className="order-num">
            {`${tag}-${orderNumber+1}`}
          </span>
          <h3>{attributes["Name"]}</h3>
          <a onClick={toggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
          {expanded && (
            <div>Hey I'm expanded</div>
          )}
        </div>
        <div className={styles.imageSection}>
          {imgArr.map((imgUrl) => (
            <a className={styles.imageSectionItem} key={imgUrl} href={imgUrl} target="_blank" onClick={e=>e.stopPropagation()}>
              <img className={imgArr.length === 1 ? "one" : "two"} src={imgUrl} />
            </a>
          ))}
        </div>
      </div>
      {showEditFinishModal && <AddEditFinishModal finishDetails={finishDetails} onClose={toggleShowEditFinishModal} />}
    </>
  )
}

export default FinishCard;
