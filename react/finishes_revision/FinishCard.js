import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Label } from 'semantic-ui-react';

import { attrMap, getAttrList, finishCategories } from '../../common/constants.js';

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
  const [focusedChild, setFocusedChild] = useState(null);

  const _isEditing = useRef(false);
  const _itemsRef = useRef([]);

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

  const getFormType = (attr) => {
    if (attr === "Price") return "price";
    if (attr === "Product URL") return "url";
    if (attr === "Details") return "textArea";
    return "";
  }
  
  const imgArr = attributes["Images"] || [];

  const AttributeField = ({attr, childNum}) => {
    
    const handleClick = e => {
      console.log('click')
      e.stopPropagation();
      if (_itemsRef.current[childNum]) _itemsRef.current[childNum].click();
    }

    const goToNextInput = () => {
      // e.stopPropagation();
      console.log('tabbed')
      console.log(_itemsRef.current[childNum + 1])
      if (_itemsRef.current[childNum + 1]) _itemsRef.current[childNum + 1].click();
    }

    return (
      <div style={{ width: attr === "Details" ? "100%" : "50%", display: 'flex' }}>
        <div onClick={handleClick} className={styles.detailsFlexTableLabel}>{attr}:</div>
        <span>{ attr === "Price" && attributes[attr] ? "$" : ""}</span>
        <FocusEditableInput
          key={attr}
          // ref={el => _itemsRef.current[childNum] = el}
          inputRef={el => {
            console.log({el})
            _itemsRef.current[childNum] = el
          }}
          // forwardedRef={inputRef}
          editable={isAdmin && !isFieldLocked(attr)}
          value={attributes[attr]}
          type={getFormType(attr)}
          oneLine={attr !== "Details"}
          onValidate={(val) => isValid(val,attr)}
          onUpdate={(val) => {
            handleAttrChange(val, attr);
            setTimeout(() => {_isEditing.current = false}, 100);
          }}
          isFocusedByLabel={focusedChild === childNum}
          focusedChild={focusedChild}
          goToNextInput={() => goToNextInput()}
          onOpen={() => _isEditing.current = true}
          onCancel={() => _isEditing.current = false}
          error={formFieldError.field === attr}
          onError={() => setFormFieldError({ error: true, field: attr })}
          clearError={() => setFormFieldError({ error: false, field: '' })}
        />
      </div>
    );
  }

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
            {(attrList.filter(attr => !detailsExclude.includes(attr)) || []).map((attr, i) => {
              return <AttributeField key={attr} attr={attr} childNum={i} />
            }
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
