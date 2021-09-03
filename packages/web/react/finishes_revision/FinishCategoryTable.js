import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import FinishCard from './FinishCard';
import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from "./FinishCategoryTable.module.css";
import ActionCreator from './action_creators';


const FinishCategoriesTable = ({
  category,
  finishes,
  expandedCategory,
  toggleExpandCategory,
  expandedChildren,
  focusedEl,
  setFocusedEl,
  tabToNextCategory,
  tabToPrevCategory,
  updateExpandedChildren
}) => {
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  const lockedCategories = useSelector(state => state.lockedCategories);
  const categoriesHiddenFromPrint = useSelector(state => state.categoriesHiddenFromPrint);
  const isCategoryLocked = lockedCategories.includes(category);
  const isHiddenFromPrint = categoriesHiddenFromPrint[category];

  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [loadingLockedState, setLoadingLockedState] = useState(false);

  const count = finishes.length;
  
  const toggleShowAddNewModal = () => setShowAddNewModal(!showAddNewModal);
  
  const handleExpandAllCards = () => {
    if (!expandedCategory) toggleExpandCategory();
    const cards = (finishes || []).map(f => f.id);
    const allCardsOpen = cards.every(c => expandedChildren[c]);
    const nextState = {};

    if (allCardsOpen) {
      cards.forEach(c => nextState[c] = false);
    } else {
      cards.forEach(c => nextState[c] = true);
    }
    return updateExpandedChildren(nextState)
  };

  const toggleLockCategory = () => {
    setLoadingLockedState(true);
    const onSuccess = () => { setLoadingLockedState(false) };
    const onError = () => { setLoadingLockedState(false) };
    if (isCategoryLocked) return ActionCreator.unlockCategory(category, onSuccess, onError);
    return ActionCreator.lockCategory(category, onSuccess, onError);
  }

  const handleDeleteCard = finishId => ActionCreator.deleteFinish(finishId);

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    ActionCreator.updateFinishOrders({ id: draggableId, orderNumber: destination.index });
  }

  const sortedFinishes = finishes.sort((a,b) => a.orderNumber - b.orderNumber);

  return (
      <div id={category} className={`${styles.categoryContainer} ${(isHiddenFromPrint || !count) ? "hide-print" : "break-after"}`}>
        <header>
          <h2 className="mb-2 text-2xl" onClick={toggleExpandCategory}>
            <Icon className="hide-print" name={expandedCategory ? "angle down" : "angle up"} />
            {category}
            <span className={`${styles.expandCollapseText} hide-print`}>
              <a href="#/">
                {expandedCategory ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
              </a>
            </span>
          </h2>
          {adminMode && (
            <div className="hide-print" style={{ width: 200, textAlign: "right" }}>
              {!isCategoryLocked && <Button icon="unlock alternate" title="click to lock order of finishes" onClick={toggleLockCategory} disabled={loadingLockedState} />}
              {IS_SUPER_ADMIN && isCategoryLocked && <Button icon="lock" title="click to unlock order of finishes" onClick={toggleLockCategory} disabled={loadingLockedState} />}
              <Button icon="plus" title="add a new finish in this category" onClick={toggleShowAddNewModal} />
              <Button icon="expand arrows alternate" title="expand all finish details" onClick={handleExpandAllCards} />
            </div>
          )}
        </header>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={category} type="CARD">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {expandedCategory && sortedFinishes.map((f, i) => {
                  const isFirstCard = i === 0;
                  const isLastCard = i === finishes.length - 1;
                  return (
                    <FinishCard
                      key={f.id}
                      cardId={f.id}
                      finishDetails={f}
                      focusedEl={focusedEl}
                      isCardOrderLocked={isCategoryLocked}
                      setFocusedEl={setFocusedEl}
                      tabToNextCategory={tabToNextCategory}
                      tabToPrevCategory={tabToPrevCategory}
                      expandedDetails={expandedChildren[f.id]}
                      isFirstCard={isFirstCard}
                      isLastCard={isLastCard}
                      nextCardId={isLastCard ? null : sortedFinishes[i + 1].id}
                      prevCardId={isFirstCard ? null : sortedFinishes[i - 1].id}
                      toggleExpand={() => {
                        if (!expandedChildren.hasOwnProperty(f.id)) {
                          updateExpandedChildren({ ...expandedChildren, [f.id]: true });
                        } else {
                          updateExpandedChildren({ ...expandedChildren, [f.id]: !expandedChildren[f.id]});
                        }
                      }}
                      expandSiblingCard={(siblingId) => {
                        if (!expandedChildren[siblingId]) updateExpandedChildren({ ...expandedChildren, [siblingId]: true });
                      }}
                      onDelete={handleDeleteCard}
                  />
                )})}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {showAddNewModal && <AddEditFinishModal preselectedCategory={category} onClose={toggleShowAddNewModal} />}
      </div>
  );
}

export default FinishCategoriesTable;
