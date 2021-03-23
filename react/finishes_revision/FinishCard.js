import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';


import { getAttrList, finishCategories } from '../../common/constants';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({ tag, finishDetails, shouldExpand={}, onDelete }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { id, orderNumber, attributes, category } = finishDetails;
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

  const handleNameChange = (val) => {
    const newAttributes = { ...finishDetails.attributes, "Name": val }
    const onSuccess = () => {};
    const onError = () => console.error('error');
    ActionCreator.updateFinish({ ...finishDetails, attributes: newAttributes }, onSuccess, onError)
  }

  const attrList = getAttrList(finishCategories[category]).map(a => a.name);

  const imgArr = attributes["Images"] || [];
  return (
    <Draggable draggableId={`${id}`} index={orderNumber}>
      {(provided, snapshot) => (
        <article
          className={`${isAdmin ? styles.adminMode : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div 
            className={`table-row ${styles.finishCard} ${snapshot.isDragging ? styles.draggingState : ''}`} 
            onClick={toggleShowEditFinishModal}
          >
            {isAdmin && (
              <AdminControls
                dragHandleProps={provided.dragHandleProps}
                onClickTrash={() => onDelete(id)}
              />
            )}
            <div className={styles.detailsSection}>
              <div className={styles.detailsHeadingContainer} onClick={e => e.stopPropagation()}>
                <span className={styles.cellHeading}>
                  {`${tag}${orderNumber+1}`}
                </span>
                <div className={styles.cellHeading}>
                  <FocusEditableInput
                    editable={isAdmin}
                    value={attributes["Name"]}
                    onUpdate={handleNameChange}
                  />
                </div>
              </div>
              <div className={styles.detailsTableContainer}>
                <a onClick={toggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
                {expanded && (
                  <table className={styles.detailsTable}>
                    <tbody>
                      {(attrList.filter(a => !detailsExclude.includes(a)) || []).map(a => (
                          <tr key={a}>
                            <td style={{ fontWeight: 'bold', paddingRight: 20 }}>{a}:</td>
                            {a === "Product URL" ? (
                              <td><a target="_blank" onClick={e => e.stopPropagation()} href={`//${attributes[a]}`}>{attributes[a]}</a></td>) : (
                              <td>{(a === "Price" && attributes[a]) ? "$" : ""}{attributes[a]}</td>
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
      )}
    </Draggable>
  )
}

export default FinishCard;
