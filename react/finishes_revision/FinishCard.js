import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

import { getAttrList, finishCategories, getAttrWidth } from '../../common/constants.js';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({ tag, finishDetails, expanded, toggleExpand, onDelete }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { id, orderNumber, attributes, category } = finishDetails;
  const [showEditFinishModal, setShowEditFinishModal] = useState(false);

  const _isEditing = useRef(false);

  const detailsExclude = ["Images","Name"];

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    toggleExpand();
  };

  const toggleShowEditFinishModal = () => {
    if (_isEditing.current) return false;
    if (isAdmin) setShowEditFinishModal(!showEditFinishModal)
  };

  const handleAttrChange = (val, attr) => {
    const newAttributes = { ...finishDetails.attributes, [attr]: val }
    const onSuccess = () => {};
    const onError = () => console.error('error');
    ActionCreator.updateFinish({ ...finishDetails, attributes: newAttributes }, onSuccess, onError);
  }

  const attrList = getAttrList(finishCategories[category]).map(a => a.name);

  const imgArr = attributes["Images"] || [];

  const cardContents = (
    <>
      <div className={styles.detailsSection}>
        <div className={styles.detailsHeadingContainer} onClick={e => e.stopPropagation()}>
          <span className={styles.cellHeading}>
            {`${tag}${orderNumber+1}`}
          </span>
          <div className={`${styles.cellHeading} ${styles.cardName}`}>
            <FocusEditableInput
              editable={isAdmin}
              value={attributes["Name"]}
              onUpdate={(val) => {
                handleAttrChange(val, "Name");
                setTimeout(() => {_isEditing.current = false}, 100);
              }}
              onOpen={() => _isEditing.current = true}
            />
          </div>
        </div>
        <div className={styles.detailsTableContainer}>
          <div className={`${styles.detailsToggleLink} hide-print`}>
            <a onClick={handleToggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
          </div>
          <div className={`${styles.detailsFlexTable} ${expanded ? styles.showDetails : styles.hideDetails}`}>
            {(attrList.filter(a => !detailsExclude.includes(a)) || []).map(a => (
              <div key={a} style={{ width: getAttrWidth(a) < 16 ? "50%" : "100%", display: 'flex' }}>
                <div style={{ fontWeight: 'bold', paddingRight: 20, width: 135 }}>{a}:</div>
                {a === "Product URL" ? (
                  <div>
                    <FocusEditableInput
                      editable={isAdmin}
                      value={attributes[a]}
                      isURL={true}
                      link={<a target="_blank" onClick={e => e.stopPropagation()} href={`/${attributes[a]}`}>{attributes[a]}</a>}
                      onUpdate={(val) => {
                        handleAttrChange(val, a);
                        setTimeout(() => {_isEditing.current = false}, 100);
                      }}
                      onOpen={() => _isEditing.current = true}
                    />
                  </div>
                  ) : (
                  <div>
                    {(a === "Price" && attributes[a]) ?  "$" : ""}
                    <FocusEditableInput
                      editable={isAdmin}
                      value={attributes[a] || ''}
                      onUpdate={(val) => {
                        handleAttrChange(val, a);
                        setTimeout(() => {_isEditing.current = false}, 100);
                      }}
                      onOpen={() => _isEditing.current = true }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.imageSection}>
        {imgArr.map((imgUrl) => (
          <a key={imgUrl} className={styles.imageSectionItem} href={imgUrl} target="_blank" onClick={e=>e.stopPropagation()}>
            <img className={styles.finishCardImg} src={imgUrl} />
          </a>
        ))}
      </div>
    </>
  );

  if (isAdmin) {
    return (
      <Draggable draggableId={`${id}`} index={orderNumber}>
        {(provided, snapshot) => (
          <article
            className={`show-print ${styles.adminMode}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div 
              className={`table-row ${styles.finishCard} ${snapshot.isDragging ? styles.draggingState : ''}`} 
              onClick={toggleShowEditFinishModal}
            >
              <AdminControls
                dragHandleProps={provided.dragHandleProps}
                onClickTrash={() => onDelete(id)}
              />
              {cardContents}
            </div>
            {showEditFinishModal && <AddEditFinishModal finishDetails={finishDetails} onClose={toggleShowEditFinishModal} />}
          </article>
        )}
      </Draggable>
    );
  }

  return (
    <article className={"show-print"}>
      <div className={`table-row ${styles.finishCard}`}>
        {cardContents}
      </div>
    </article>
  );
}

export default FinishCard;
