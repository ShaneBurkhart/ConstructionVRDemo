import React, { useState, useEffect } from 'react';
import FinishCategoryTable from './FinishCategoryTable';
import _ from 'underscore';
import TabContext from './contexts/TabContext';
import TabContextController from './TabContextController';

function FinishCategoriesTable({ initExpansionTree, finishes, categoryList, adminMode }) {

  const [expansionTree, setExpansionTree] = useState(null);

  useEffect(() => {
    setExpansionTree(initExpansionTree);
  }, [initExpansionTree]);

  
  const toggleExpandCategory = (category) => {
    setExpansionTree(prev => (
      {
        ...prev,
        [category]: { ...prev[category], expanded: !prev[category].expanded } 
      }
    ));
  }

  const collapseAllCategories = () =>
    categoryList.forEach(category => setExpansionTree(prev => ({ ...prev, [category]: { ...prev[category], expanded: false } })));
  
  const expandAllCategories = () =>
    categoryList.forEach(category => setExpansionTree(prev => ({ ...prev, [category]: { ...prev[category], expanded: true } })));
  
  const expandAllDetails = () => {
    const setAllTrue = (obj) => {
      const nextObj = {...obj};
      const arr = Object.keys(obj);
      arr.forEach(i => nextObj[i] = true);
      return nextObj;
    };
    categoryList.forEach(category => setExpansionTree(prev => ({ ...prev, [category]: { ...prev[category], expanded: true, expandedChildren: setAllTrue(prev[category].expandedChildren) } })))
  };
  
  const collapseAllDetails = () => {
    const setAllFalse = (obj) => {
      const nextObj = {...obj};
      const arr = Object.keys(obj);
      arr.forEach(i => nextObj[i] = false);
      return nextObj;
    };
    categoryList.forEach(category => setExpansionTree(prev => ({ ...prev, [category]: { ...prev[category], expandedChildren: setAllFalse(prev[category].expandedChildren) } })))
  };
  
  return (
    <TabContextController categoryList={categoryList}>
      <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        <a onClick={expandAllCategories}>Expand All Categories</a><br />
        <a onClick={collapseAllCategories}>Close All Categories</a><br />
        <a onClick={expandAllDetails}>Expand All Details</a><br />
        <a onClick={collapseAllDetails}>Close All Details</a><br />
        {(categoryList || []).map((category) => (
          <FinishCategoryTable
            key={category}
            category={category}
            finishes={finishes.filter(f => f.category === category)}
            expandedCategory={expansionTree[category] ? expansionTree[category].expanded : true}
            expandedChildren={expansionTree[category] ? expansionTree[category].expandedChildren : {}}
            handleExpandedChildren={(nextExpandedChildren) => setExpansionTree(prev => ({...prev, [category]: {...prev[category], expandedChildren: nextExpandedChildren }}))}
            toggleExpandCategory={() => toggleExpandCategory(category)}
          />
        ))}
      </section>
  </TabContextController>
  )
}

export default FinishCategoriesTable
