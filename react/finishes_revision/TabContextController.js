import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TabContext from './contexts/TabContext';

const TabContextController = ({ children, categoryList }) => {
  const [focusedEl, setFocusedEl] = useState(null);
  const finishes = useSelector(state => state.finishes);

  const goToNextCategory = (currentCategory) => {
    const currentCatIdx = categoryList.indexOf(currentCategory);
    const nextCategory = categoryList[currentCatIdx + 1] ? categoryList[currentCatIdx + 1] : null;
    if (nextCategory) setFocusedEl([nextCategory, 0, -1]);
  }

  const goToPrevCategory = (currentCategory) => {
    const currentCatIdx = categoryList.indexOf(currentCategory);
    if (currentCatIdx === 0) return;
    
    const prevCategory = categoryList[currentCatIdx - 1];
    
    const categoryCardLength = finishes.filter(f => f.category === prevCategory).length;
    
    setFocusedEl([prevCategory, categoryCardLength - 1, -1]);
  
    /* This block will get the last attribute of field of the previous card
      const categoryDetails = finishes.find(f => f.category === prevCategory);
      const categoryAttributes = categoryDetails.attributes;
      const attributesArr = Object.keys(categoryDetails.attributes).length - 1;
      
      const excludedDetails = ["Name", "Images"];
      const lastAttrField = attributesArr - excludedDetails.length;
      setFocusedEl([prevCategory, categoryCardLength - 1, lastAttrField]);
    */
  }

  const contextValue = {
    focusedEl,
    setFocusedEl,
    goToNextCategory,
    goToPrevCategory,
  };

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
}

export default TabContextController;
