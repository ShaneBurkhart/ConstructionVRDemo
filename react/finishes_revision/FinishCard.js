import React, { useState, useRef, useEffect, useContext } from 'react';
import TabContext from './contexts/TabContext';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Label } from 'semantic-ui-react';

import { attrMap, getAttrList, finishCategories } from '../../common/constants.js';

import AddEditFinishModal from './modals/AddEditFinishModal';
import AdminControls from '../components/AdminControls';
import FocusEditableInput from '../components/FocusEditableInput';

import styles from './FinishCard.module.css';
import ActionCreator from './action_creators';

const FinishCard = ({ tag, idx: cardIdx, finishDetails, expanded, toggleExpand, onDelete }) => {
  const isAdmin = useSelector(state => state.adminMode);
  const { id, orderNumber, attributes, category } = finishDetails;

  const { setFocusedEl, focusedEl, tabToNextEl, tabToPrevEl, registerAttrCount } = useContext(TabContext);

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

  useEffect(() => {
    registerAttrCount(cardIdx, attrList.filter(attr => !detailsExclude.includes(attr)).length - 1)
  }, []);

  const isValid = (val, attr) => attrMap[attr].validate(val);

  const isFieldLocked = (attr) => formFieldError.error && formFieldError.field !== attr;

  const handleTab = (e, isFirstChild, isLastChild) => {
    if (e.shiftKey){
      return tabToPrevEl(isFirstChild);
    } 
    return tabToNextEl(isLastChild)
  }

  const getFormType = (attr) => {
    if (attr === "Price") return "price";
    if (attr === "Product URL") return "url";
    if (attr === "Details") return "textArea";
    return "";
  }

  const renderAttributeField = (attr, idx) => {    
    const focusKeySig = [ category, cardIdx, idx ];
    
    const handleClick = (e) => {
      e.stopPropagation();
      setFocusedEl(focusKeySig);
    };

    return (
      <div key={attr} onClick={handleClick} style={{ width: attr === "Details" ? "100%" : "50%", display: 'flex' }}>
        <div className={styles.detailsFlexTableLabel}>{attr}:</div>
        <span>{ attr === "Price" && attributes[attr] ? "$" : ""}</span>
        <FocusEditableInput
          editable={isAdmin && !isFieldLocked(attr)}
          isLastChild={attr === "Details"}
          isExpandedExternally={true}
          expanded={(focusedEl || []).join("") === (focusKeySig || ['x']).join("")}
          clearExpanded={() => setFocusedEl(null)}
          handleExpanded={handleClick}
          handleTab={handleTab}
          value={attributes[attr]}
          type={getFormType(attr)}
          oneLine={attr !== "Details"}
          onValidate={(val) => isValid(val,attr)}
          onUpdate={(val) => {
            handleAttrChange(val, attr);
            setTimeout(() => {_isEditing.current = false}, 100);
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
              isExpandedExternally={true}
              expanded={(focusedEl || []).join("") === ([ category, cardIdx, -1 ] || ['x']).join("")}
              handleTab={handleTab}
              value={attributes["Name"]}
              onUpdate={(val) => {
                handleAttrChange(val, "Name");
                setTimeout(() => {_isEditing.current = false}, 100);
              }}
              onOpen={() => _isEditing.current = true}
              onCancel={() => _isEditing.current = false}
            />
            {formFieldError.error && <Label className="hide-print" style={{ marginLeft: 20 }} basic color="red" size="mini">Invalid value</Label>}
          </div>
        </div>
        <div className={styles.detailsTableContainer}>
          <div className={`${styles.detailsToggleLink} hide-print`}>
            <a onClick={handleToggleExpand}>{`${expanded ? "Hide" : "Show"}`} Details</a>
          </div>
          <div className={`${styles.detailsFlexTable} ${expanded ? styles.showDetails : styles.hideDetails}`}>
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
