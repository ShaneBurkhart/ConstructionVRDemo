import React, { useState } from 'react';

import EditFinishModal from './modals/EditFinishModal';

import styles from './FinishCard.module.css';

const FinishCard = ({ tag, finishDetails }) => {
  const { orderNumber, attributes } = finishDetails;
  const [showEditFinishModal, setShowEditFinishModal] = useState(false);

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
        </div>
        <div className={styles.imageSection}>
          {imgArr.map((imgUrl) => (
            <a className={styles.imageSectionItem} key={imgUrl} href={imgUrl} target="_blank" onClick={e=>e.stopPropagation()}>
              <img className={imgArr.length === 1 ? "one" : "two"} src={imgUrl} />
            </a>
          ))}
        </div>
      </div>
      {showEditFinishModal && <EditFinishModal finishDetails={finishDetails} onClose={toggleShowEditFinishModal} />}
    </>
  )
}

export default FinishCard;
