import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import { getCategoryTag } from '../../common/constants';

import FinishCard from './FinishCard';
import AddEditFinishModal from './modals/AddEditFinishModal';

import styles from "./FinishCategoryTable.module.css";
import ActionCreator from './action_creators';


const FinishCategoriesTable = ({ category, finishes }) => {
  const [expanded, setExpanded] = useState(true);
  const [expandAllCards, setExpandAllCards] = useState({ status: false, clicked: 0 }); 
  const [showAddNewModal, setShowAddNewModal] = useState(false);

  const isAdmin = useSelector(state => state.adminMode);

  const count = finishes.length;
  const tag = category ? getCategoryTag(category) : '';
  
  const toggleCollapse = () => setExpanded(!expanded);

  const toggleShowAddNewModal = () => setShowAddNewModal(!showAddNewModal);
  
  const handleExpandAllCards = () => setExpandAllCards(prev => ({ status: true, clicked: ++prev.clicked }));

  const handleDeleteCard = finishId => ActionCreator.deleteFinish(finishId);

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    ActionCreator.updateFinishOrders({ id: draggableId, orderNumber: destination.index });
  }
  

  return (
    <div id={category} className={`${styles.categoryContainer} ${count ? "no-print" : ""}`}>
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
                  shouldExpand={expandAllCards}
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