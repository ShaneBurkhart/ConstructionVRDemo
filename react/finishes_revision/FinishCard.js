import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Label } from 'semantic-ui-react';

import { attrMap, getAttrList, finishCategoriesMap } from '../../common/constants.js';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({
  tag,
  cardId,
  nextCardId,
  prevCardId,
  finishDetails,
  isFirstCard,
  isLastCard,
  focusedEl,
  setFocusedEl,
  tabToNextCategory,
  tabToPrevCategory,
  expandedDetails,
  toggleExpand,
  onDelete,
  expandSiblingCard,
}) => {
  const isAdmin = IS_SUPER_ADMIN || IS_EDITOR;
  const { id, orderNumber, attributes, category } = finishDetails;


  const [showEditFinishModal, setShowEditFinishModal] = useState(false);
  const [formFieldError, setFormFieldError] = useState({ error: false, field: '' });

  const _isEditing = useRef(false);

  const excludedDetails = ["Images"];

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    toggleExpand();
  };

  const toggleShowEditFinishModal = () => {
    if (_isEditing.current) {
      _isEditing.current = false;
      return false
    };
    if (isAdmin) setShowEditFinishModal(!showEditFinishModal)
  };

  const handleAttrChange = (val, attr) => {
    const newAttributes = { ...finishDetails.attributes, [attr]: val };
    const onSuccess = () => {};
    const onError = () => console.error('error');
    ActionCreator.updateFinish({ ...finishDetails, attributes: newAttributes }, onSuccess, onError);
  }
  const attrList = getAttrList(finishCategoriesMap[category]).map(a => a.name);
  const filteredAttrList = attrList.filter(attr => !excludedDetails.includes(attr));


  const firstAttr = filteredAttrList[0];
  const lastAttr = filteredAttrList[filteredAttrList.length - 1];
  
  const tabToNextInput = (nextAttr) =>  {
    const isLastChild = !nextAttr;
    if (!isLastChild){
      if (!expandedDetails) toggleExpand();
      return setFocusedEl([ category, cardId, nextAttr ]);
    } else if (isLastChild && !isLastCard){
      expandSiblingCard(nextCardId);
      return setFocusedEl([ category, nextCardId, firstAttr]);
    } else if (isLastCard){
      return tabToNextCategory();
    }
  }
  
  const tabToPrevInput = (prevAttr) => {
    const isFirstChild = !prevAttr;
    if (!isFirstChild){
      return setFocusedEl([ category, cardId, prevAttr ]);
    } else if (isFirstChild && !isFirstCard){
      expandSiblingCard(prevCardId);
      return setFocusedEl([ category, prevCardId, lastAttr]);
    } else if (isFirstCard){
      return tabToPrevCategory();
    }
  }

  const isValid = (val, attr) => attrMap[attr].validate(val);

  const isFieldLocked = (attr) => formFieldError.error && formFieldError.field !== attr;

  const handleTab = (e, prevAttr, nextAttr) => {
    if (e.shiftKey){
      return tabToPrevInput(prevAttr);
    } 
    return tabToNextInput(nextAttr);
  }

  const getFormType = (attr) => {
    if (attr === "Price") return "price";
    if (attr === "Product URL") return "url";
    if (attr === "Details") return "textArea";
    return "";
  }

  const renderAttributeField = (attr, prevAttr, nextAttr) => {    
    const focusKeySig = [ category, cardId, attr ];
    
    const handleInputClick = (e) => {
      e.stopPropagation();
      handleSetFocusedEl();
    };

    const handleSetFocusedEl = () => setFocusedEl(focusKeySig);

    return (
      <div key={attr} onClick={handleInputClick} style={{ width: attr === "Details" ? "100%" : "50%", display: 'flex' }}>
        <div className={styles.detailsFlexTableLabel}>{attr}:</div>
        <span>{ attr === "Price" && attributes[attr] ? "$" : ""}</span>
        <FocusEditableInput
          editable={isAdmin && !isFieldLocked(attr)}
          expanded={(focusedEl || []).join("") === (focusKeySig || ['x']).join("")}
          clearExpanded={() => setFocusedEl(null)}
          handleExpanded={handleSetFocusedEl}
          handleTab={(e) => handleTab(e, prevAttr, nextAttr)}
          value={attributes[attr]}
          type={getFormType(attr)}
          oneLine={attr !== "Details"}
          onValidate={(val) => isValid(val,attr)}
          onUpdate={(val) => {
            handleAttrChange(val, attr);
            if (!focusedEl) setTimeout(() => {_isEditing.current = false}, 100);
          }}
          onOpen={() => _isEditing.current = true}
          onCancel={() => _isEditing.current = false}
          error={formFieldError.field === attr}
          onError={() => setFormFieldError({ error: true, field: attr })}
          clearError={() => setFormFieldError({ error: false, field: '' })}
        />
      </div>
    )
  }
  
  const imgArr = attributes["Images"] || [];

  const attrArr = attrList.filter(a => attributes[a] && !["Images","Details"].includes(a)).map(a => attributes[a]);
  const displayName = attrArr.join(", ");

  const cardContents = (
    <>
      <div className={styles.detailsSection}>
        <div className={styles.detailsHeadingContainer}>
          <span className={styles.cellHeading}>
            {`${tag}${orderNumber+1}`}
          </span>
          <div className={`${styles.cellHeading} ${styles.cardName}`}>
            <span>{displayName}</span>
          </div>
        </div>
        <div className={styles.detailsTableContainer}>
          <div className={`${styles.detailsToggleLink} hide-print`}>
            <a onClick={handleToggleExpand}>{`${expandedDetails ? "Hide" : "Show"}`} Details</a>
            {formFieldError.error && <Label className="hide-print" style={{ marginLeft: 20 }} basic color="red" size="mini">Invalid value</Label>}
          </div>
          <div className={`${styles.detailsFlexTable} ${expandedDetails ? styles.showDetails : styles.hideDetails}`}>
            {(filteredAttrList || []).map((attr, i) => {
              const prevAttr = (i === 0) ? "" : filteredAttrList[i - 1];
              const nextAttr = (i === filteredAttrList.length - 1) ? "" : filteredAttrList[i+1];
              return (
                renderAttributeField(attr, prevAttr, nextAttr)
              )}
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
          className={`show-print ${styles.adminMode}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          >
            <div 
              id={`finishCard-${id}`}
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
      <div id={`finishCard-${id}`} className={`table-row ${styles.finishCard}`}>
        {cardContents}
      </div>
    </article>
  );
}

export default FinishCard;
