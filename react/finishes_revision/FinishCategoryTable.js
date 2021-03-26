import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import { getCategoryTag } from '../../common/constants';

import FinishCard from './FinishCard';
import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from "./FinishCategoryTable.module.css";
import ActionCreator from './action_creators';


const FinishCategoriesTable = ({ category, finishes }) => {
  // const finishesMap = {};
  // (finishes || []).forEach(f => finishesMap[f.id] = false);

  const [expanded, setExpanded] = useState(true);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  // const [expandedChildren, setExpandedChildren] = useState(finishesMap);
  const [expandedChildren, setExpandedChildren] = useState({});

  useEffect(() => {
    const finishesMap = {...expandedChildren};
    (finishes || []).forEach(f => {
      if (!finishesMap.hasOwnProperty(f.id))
        finishesMap[f.id] = false
    });
    setExpandedChildren(finishesMap);
  }, [finishes])

  const isAdmin = useSelector(state => state.adminMode);

  const count = finishes.length;
  const tag = category ? getCategoryTag(category) : '';
  
  const toggleCollapse = () => setExpanded(!expanded);

  const toggleShowAddNewModal = () => setShowAddNewModal(!showAddNewModal);
  
  const handleExpandAllCards = () => {
    const children = Object.keys(expandedChildren);
    const closeAll = () => children.forEach(child => setExpandedChildren(prev => ({ ...prev, [child]: false })));
    const openAll = () => children.forEach(child => setExpandedChildren(prev => ({ ...prev, [child]: true })));
    const allOpen = children.every(child => expandedChildren[child]);
    if (!allOpen) return openAll();
    return closeAll();
  };

  const handleDeleteCard = finishId => ActionCreator.deleteFinish(finishId);

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    ActionCreator.updateFinishOrders({ id: draggableId, orderNumber: destination.index });
  }

  return (
    <div id={category} className={`${styles.categoryContainer} ${!count ? "no-print" : "break-after"}`}>
      <header>
        <h2 onClick={toggleCollapse}>
          <Icon className="hide-print" name={expanded ? "angle down" : "angle up"} />
          {category}
          <span className={`${styles.expandCollapseText} hide-print`}>
            <a href="#/">
              {expanded ? `Collapse (${count} selections)` : `Expand (${count} selections)` }
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
              {expanded && finishes.sort((a,b) => a.orderNumber - b.orderNumber).map(f => (
                <FinishCard
                  key={f.id}
                  tag={tag}
                  finishDetails={f}
                  expanded={expandedChildren[f.id]}
                  toggleExpand={() => setExpandedChildren(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
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