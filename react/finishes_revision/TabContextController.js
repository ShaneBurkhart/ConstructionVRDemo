import React, { useState } from 'react';
import TabContext from './contexts/TabContext';

const TabContextController = ({ children }) => {
  const [attrCountMap, setAttrCountMap] = useState({});
  const [focusedEl, setFocusedEl] = useState(null);

  const tabToNextEl = (isLastChild) => {
    if (focusedEl && focusedEl.length) {
      const [ category, cardIdx, idx ] = focusedEl;
      const nextIdx = isLastChild ? -1 : idx + 1;
      const nextCardIdx = isLastChild ? cardIdx + 1 : cardIdx
      setFocusedEl([ category, nextCardIdx, nextIdx ]);
    }
  }

  const tabToPrevEl = (isFirstChild) => {
    if (focusedEl && focusedEl.length) {
      const [ category, cardIdx, idx ] = focusedEl;
      const prevCard = cardIdx - 1;
      const prevCardLastChild = attrCountMap[prevCard]
      const prevIdx = isFirstChild ? prevCardLastChild : idx - 1;
      const prevCardIdx = isFirstChild ? prevCard : cardIdx;
      setFocusedEl([ category, prevCardIdx, prevIdx ]);
    }
  }
  
  const registerAttrCount = (cardIdx, attrCount) => setAttrCountMap(prev => ({ ...prev, [cardIdx]: attrCount }))

  const contextValue = {
    focusedEl,
    registerAttrCount,
    setFocusedEl,
    tabToNextEl,
    tabToPrevEl,
  };

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
}

export default TabContextController;
