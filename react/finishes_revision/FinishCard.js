import React, { useState, useRef, useContext, useEffect } from 'react';
import TabContext from './contexts/TabContext';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Label } from 'semantic-ui-react';

import { attrMap, getAttrList, finishCategoriesMap } from '../../common/constants.js';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({ tag, cardIdx, finishDetails, isFirstCard, isLastCard, expandedDetails, toggleExpand, onDelete, expandPrevSibling }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { id, orderNumber, attributes, category } = finishDetails;

  const { setFocusedEl, focusedEl, goToNextCategory, goToPrevCategory } = useContext(TabContext);

  const [showEditFinishModal, setShowEditFinishModal] = useState(false);
  const [formFieldError, setFormFieldError] = useState({ error: false, field: '' });

  const _isEditing = useRef(false);

  const detailsExclude = ["Images","Name"];

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
    const newAttributes = { ...finishDetails.attributes, [attr]: val }
    const onSuccess = () => {};
    const onError = () => console.error('error');
    ActionCreator.updateFinish({ ...finishDetails, attributes: newAttributes }, onSuccess, onError);
  }
  const attrList = getAttrList(finishCategoriesMap[category]).map(a => a.name);

  const lastInputIdx = attrList.filter(attr => !detailsExclude.includes(attr)).length - 1;
  
  const tabToNextInput = (isLastChild) =>  {
    const [ cat, cardIdx, idx ] = focusedEl;
    if (!isLastChild){
      if (!expandedDetails) toggleExpand();
      return setFocusedEl([ cat, cardIdx, idx + 1 ]);
    } else if (isLastChild && !isLastCard){
      return setFocusedEl([ cat, cardIdx + 1, -1]);
    } else if (isLastCard){
      return goToNextCategory(category);
    }
  }
  
  const tabToPrevInput = (isFirstChild) => {
    const [ cat, cardIdx, idx ] = focusedEl;
    if (!isFirstChild){
      return setFocusedEl([ cat, cardIdx, idx - 1 ]);
    } else if (isFirstChild && !isFirstCard){
      expandPrevSibling();
      return setFocusedEl([ cat, cardIdx - 1, lastInputIdx]);
    } else if (isFirstCard){
      return goToPrevCategory(category);
    }
  }

  const isValid = (val, attr) => attrMap[attr].validate(val);

  const isFieldLocked = (attr) => formFieldError.error && formFieldError.field !== attr;

  const handleTab = (e, isFirstChild, isLastChild) => {
    if (e.shiftKey){
      return tabToPrevInput(isFirstChild);
    } 
    return tabToNextInput(isLastChild);
  }

  const getFormType = (attr) => {
    if (attr === "Price") return "price";
    if (attr === "Product URL") return "url";
    if (attr === "Details") return "textArea";
    return "";
  }

  const renderAttributeField = (attr, idx) => {    
    const focusKeySig = [ category, cardIdx, idx ];
    
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
          isLastChild={attr === "Details"}
          expanded={(focusedEl || []).join("") === (focusKeySig || ['x']).join("")}
          clearExpanded={() => setFocusedEl(null)}
          handleExpanded={handleSetFocusedEl}
          handleTab={handleTab}
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

  const cardContents = (
    <>
      <div className={styles.detailsSection}>
        <div className={styles.detailsHeadingContainer} onClick={e => e.stopPropagation()}>
          <span className={styles.cellHeading}>
            {`${tag}${orderNumber+1}`}
          </span>
          <div className={`${styles.cellHeading} ${styles.cardName}`}>
            <FocusEditableInput
              isFirstChild={true}
              editable={isAdmin}
              expanded={(focusedEl || []).join("") === ([ category, cardIdx, -1 ] || ['x']).join("")}
              handleExpanded={() => setFocusedEl([ category, cardIdx, -1 ])}
              clearExpanded={() => setFocusedEl(null)}
              handleTab={handleTab}
              value={attributes["Name"]}
              onUpdate={(val) => {
                handleAttrChange(val, "Name");
                if (!focusedEl) setTimeout(() => {_isEditing.current = false}, 100);
              }}
              onOpen={() => _isEditing.current = true}
              onCancel={() => _isEditing.current = false}
            />
            {formFieldError.error && <Label className="hide-print" style={{ marginLeft: 20 }} basic color="red" size="mini">Invalid value</Label>}
          </div>
        </div>
        <div className={styles.detailsTableContainer}>
          <div className={`${styles.detailsToggleLink} hide-print`}>
            <a onClick={handleToggleExpand}>{`${expandedDetails ? "Hide" : "Show"}`} Details</a>
          </div>
          <div className={`${styles.detailsFlexTable} ${expandedDetails ? styles.showDetails : styles.hideDetails}`}>
            {(attrList.filter(attr => !detailsExclude.includes(attr)) || []).map((attr, i) => (
                renderAttributeField(attr, i)
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
