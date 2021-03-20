import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ActionCreators from './action_creators';

import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import FinishCategoryTable from './FinishCategoryTable';
import { DragDropContext } from 'react-beautiful-dnd';

import "./FinishSelectionTable.css";


const App = () => {
  const dispatch = useDispatch();
  const adminMode = useSelector(state => state.adminMode);
  const finishes = useSelector(state => state.finishes);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  const activeCategoryMap = {};
  finishes.forEach(({category}) => {
    if (!activeCategoryMap[category]) activeCategoryMap[category] = 0;
    activeCategoryMap[category]++
  });

  const onDragStart = () => setIsDragging(true);

  const onDragEnd = result => {
    console.log({result});
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId == destination.droppableId && source.index == destination.index) return;
    if (result["type"] === "CATEGORY") {
      console.log("category onDragEnd")
    }
    setIsDragging(false);
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <main>
        {adminMode && <FinishCategoriesDrawer activeCategoryMap={activeCategoryMap} />}
        <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
          {(Object.keys(activeCategoryMap) || []).map(category => (
            <FinishCategoryTable
              key={category}
              category={category}
              finishes={finishes.filter(f => f.category === category)}
            />
          ))}
        </section>
      </main>
    </DragDropContext>
  );
}

export default App;
