import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ActionCreators from './action_creators';

import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import { DragDropContext } from 'react-beautiful-dnd';


const App = () => {
  const dispatch = useDispatch();
  const adminMode = useSelector(state => state.adminMode);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

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
        {adminMode && <FinishCategoriesDrawer />}
        <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
          Hello
        </section>
      </main>
    </DragDropContext>
  );
}

export default App;