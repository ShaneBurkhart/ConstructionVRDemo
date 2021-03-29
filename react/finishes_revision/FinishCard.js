import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Label } from 'semantic-ui-react';

import { attrMap, getAttrList, finishCategories, getAttrWidth } from '../../common/constants.js';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({ tag, finishDetails, expanded, toggleExpand, onDelete }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { id, orderNumber, attributes, category } = finishDetails;
  
  const [showEditFinishModal, setShowEditFinishModal] = useState(false);
  const [formFieldError, setFormFieldError] = useState({ error: false, field: '' });

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

  const isValid = (val, attr) => attrMap[attr].validate(val);

  const isFieldLocked = (attr) => formFieldError.error && formFieldError.field !== attr;
  
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
            {formFieldError.error && <Label className="hide-print" style={{ marginLeft: 20 }} basic color="red" size="mini">Invalid value</Label>}
          </div>
        </div>
        <div className={styles.detailsTableContainer}>
          <div className={`${styles.detailsToggleLink} hide-print`}>
            <a onClick={handleToggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
          </div>
          <div className={`${styles.detailsFlexTable} ${expanded ? styles.showDetails : styles.hideDetails}`}>
            {(attrList.filter(attr => !detailsExclude.includes(attr)) || []).map(attr => (
                <div key={attr} style={{ width: getAttrWidth(attr) < 16 ? "50%" : "100%", display: 'flex' }}>
                  <div style={{ fontWeight: 'bold', paddingRight: 20, width: 135 }}>{attr}:</div>
                  <span>{ attr === "Price" && attributes[attr] ? "$" : ""}</span>
                  <FocusEditableInput
                    editable={isAdmin && !isFieldLocked(attr)}
                    value={attributes[attr]}
                    isURL={attr === "Product URL"}
                    isPrice={attr === "Price"}
                    onValidate={(val) => isValid(val,attr)}
                    link={
                      attr === "Product URL"
                        ? <a target="_blank" onClick={e => e.stopPropagation()} href={`//${attributes[attr]}`}>{attributes[attr]}</a> 
                        : ''
                    }
                    onUpdate={(val) => {
                      handleAttrChange(val, attr);
                      setTimeout(() => {_isEditing.current = false}, 100);
                    }}
                    onOpen={() => _isEditing.current = true}
                    error={formFieldError.field === attr}
                    onError={() => setFormFieldError({ error: true, field: attr })}
                    clearError={() => setFormFieldError({ error: false, field: '' })}
                  />
                </div>
              )
            )}
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
            id={`finishCard-${id}`}
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
    <article id={`finishCard-${id}`} className={"show-print"}>
      <div className={`table-row ${styles.finishCard}`}>
        {cardContents}
      </div>
    </article>
  );
}

export default FinishCard;
