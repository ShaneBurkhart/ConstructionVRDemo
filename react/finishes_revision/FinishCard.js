import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from './FinishCard.module.css';
import flex from '../universalStyles/flexStyles.module.css';

const FinishCard = ({ tag, finishDetails, shouldExpand }) => {
  const isAdmin = useSelector(state => state.adminMode);
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
    <article className={`${isAdmin ? styles.adminMode : ''}`}>
      <div className={`table-row ${styles.finishCard}`} onClick={toggleShowEditFinishModal}>
        <div className={styles.detailsSection}>
          <div className={flex.spaceBetween}>
            <span className={styles.cellHeading}>
              {`${tag}-${orderNumber+1}`}
            </span>
            <span className={styles.cellHeading}>{attributes["Name"]}</span>
          </div>
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
    </article>
  )
}

export default FinishCard;
