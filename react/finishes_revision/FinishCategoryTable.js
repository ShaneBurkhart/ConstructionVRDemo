import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import { getCategoryTag } from '../../common/constants.js';

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
  const isAdmin = useSelector(state => state.adminMode);
  const [showAddNewModal, setShowAddNewModal] = useState(false);

  const count = finishes.length;
  const tag = category ? getCategoryTag(category) : '';
  
  const toggleShowAddNewModal = () => setShowAddNewModal(!showAddNewModal);
  
  const handleExpandAllCards = () => {
    if (!expandedCategory) toggleExpandCategory();
    let nextChildren = [];
    const allChildren = (finishes || []).map((c,i) => i);
    const closeAll = () => [];
    const openAll = () => allChildren;
    const allOpen = allChildren.every(child => (expandedChildren || []).includes(child));
    if (!allOpen) nextChildren = openAll();
    if (allOpen) nextChildren = closeAll();
    updateExpandedChildren(nextChildren);
  };

  const handleDeleteCard = finishId => ActionCreator.deleteFinish(finishId);

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    ActionCreator.updateFinishOrders({ id: draggableId, orderNumber: destination.index });
  }

  const sortedFinishes = finishes.sort((a,b) => a.orderNumber - b.orderNumber);

  return (
      <div id={category} className={`${styles.categoryContainer} ${!count ? "no-print" : "break-after"}`}>
        <header>
          <h2 onClick={toggleExpandCategory}>
            <Icon className="hide-print" name={expandedCategory ? "angle down" : "angle up"} />
            {category}
            <span className={`${styles.expandCollapseText} hide-print`}>
              <a href="#/">
                {expandedCategory ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
              </a>
            </span>
          </h2>
          {isAdmin && (
            <h2 className="hide-print" style={{ width: 200, textAlign: "right" }}>
              <Button icon="plus" title="add a new finish in this category" onClick={toggleShowAddNewModal} />
              <Button icon="expand arrows alternate" title="expand all finish details" onClick={handleExpandAllCards} />
            </h2>
          )}
        </header>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={category} type="CARD">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {expandedCategory && sortedFinishes.map((f, idx) => (
                  <FinishCard
                    key={f.id}
                    tag={tag}
                    cardIdx={idx}
                    finishDetails={f}
                    focusedEl={focusedEl}
                    setFocusedEl={setFocusedEl}
                    tabToNextCategory={tabToNextCategory}
                    tabToPrevCategory={tabToPrevCategory}
                    expandedDetails={expandedChildren.includes(idx)}
                    isFirstCard={idx === 0}
                    isLastCard={idx === finishes.length - 1}
                    toggleExpand={() => {
                      if (expandedChildren.includes(idx)) return updateExpandedChildren([...expandedChildren.filter(c => c !== idx)]);
                      return updateExpandedChildren([...expandedChildren, idx])
                    }}
                    expandPrevSibling={() => {
                      if (idx !== 0) {
                        const prevIdx = idx - 1;
                        if (!expandedChildren.includes(prevIdx)) updateExpandedChildren([...expandedChildren, prevIdx])
                      }
                    }}
                    onDelete={handleDeleteCard}
                  />
                ))}
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
