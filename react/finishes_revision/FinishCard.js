import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from './FinishCard.module.css';

const FinishCard = ({ tag, finishDetails, shouldExpand }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { orderNumber, attributes } = finishDetails;
  const [expanded, setExpanded] = useState(shouldExpand.status);
  const [showEditFinishModal, setShowEditFinishModal] = useState(false);

  const detailsExclude = ["Images","Name"];

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
          <div className={styles.detailsHeadingContainer}>
            <span className={styles.cellHeading}>
              {`${tag}${orderNumber+1}`}
            </span>
            <span className={styles.cellHeading}>{attributes["Name"]}</span>
          </div>
          <div className={styles.detailsTableContainer}>
            <a onClick={toggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
            {expanded && (
              <table className={styles.detailsTable}>
                <tbody>
                  {(Object.keys(attributes).filter(a => !detailsExclude.includes(a)) || []).map(a => (
                      <tr key={a}>
                        <td style={{ fontWeight: 'bold', paddingRight: 20 }}>{a}:</td>
                        {a === "Product URL" ? (
                          <td><a target="_blank" onClick={e => e.stopPropagation()} href={`//${attributes[a]}`}>{attributes[a]}</a></td>) : (
                          <td>{a === "Price" ? "$" : ""}{attributes[a]}</td>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className={styles.imageSection}>
          {imgArr.map((imgUrl) => (
            <a key={imgUrl} className={styles.imageSectionItem} href={imgUrl} target="_blank" onClick={e=>e.stopPropagation()}>
              <img className={styles.finishCardImg} src={imgUrl} />
            </a>
          ))}
        </div>
      </div>
      {showEditFinishModal && <AddEditFinishModal finishDetails={finishDetails} onClose={toggleShowEditFinishModal} />}
    </article>
  )
}

export default FinishCard;
