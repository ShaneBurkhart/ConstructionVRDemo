import React, { useState } from 'react';
import TabContext from './contexts/TabContext';

const TabContextController = ({ children, categoryList, finishes, expandCategory, expandCard }) => {
  const [focusedEl, setFocusedEl] = useState(null);

  const tabToNextCategory = (currentCategory) => {
    const currentCatIdx = categoryList.indexOf(currentCategory);
    const nextCategory = categoryList[currentCatIdx + 1];
    if (nextCategory) {
      expandCategory(currentCatIdx + 1);
      expandCard(currentCatIdx + 1, 0);
      setFocusedEl([nextCategory, 0, -1]);
    };
  }

  const tabToPrevCategory = (currentCategory) => {
    const currentCatIdx = categoryList.indexOf(currentCategory);
    if (currentCatIdx === 0) return;
    
    const prevCategory = categoryList[currentCatIdx - 1];
    
    const categoryCardLength = finishes.filter(f => f.category === prevCategory).length;
    
    const categoryDetails = finishes.find(f => f.category === prevCategory);
    const attributesArr = Object.keys(categoryDetails.attributes).length - 1;
    
    const excludedDetails = ["Name", "Images"];
    const lastAttrField = attributesArr - excludedDetails.length;
    expandCategory(currentCatIdx - 1);
    expandCard(currentCatIdx - 1, categoryCardLength - 1);
    setFocusedEl([prevCategory, categoryCardLength - 1, lastAttrField]);
  }

  const contextValue = {
    focusedEl,
    setFocusedEl,
    tabToNextCategory,
    tabToPrevCategory,
  };

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
}

export default TabContextController;
