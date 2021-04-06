import React, { useState } from 'react';
import FinishCategoryTable from './FinishCategoryTable';
import _ from 'underscore';
import TabContextController from './TabContextController';

function FinishCategoriesTable({ finishes, categoryList, adminMode }) {

  const [expandedCategories, setExpandedCategories] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpandCategory = (idx) => {
    if (!expandedCategories) {
      const nextArr = [];
      categoryList.forEach((c,i) => { if (i !== idx) nextArr.push(i) });
      return setExpandedCategories(nextArr)
    };
    if (expandedCategories.includes(idx)) return setExpandedCategories([...expandedCategories].filter(i => i !== idx));
    return setExpandedCategories(prev => ([...prev, idx]));
  }

  const expandAllCategories = () => {
    const nextArr = [];
    categoryList.forEach((c, i) => nextArr.push(i));
    setExpandedCategories(nextArr)
  }

  const collapseAllCategories = () => setExpandedCategories([]);

  const expandAllDetails = () => {
    expandAllCategories();
    const nextObj = {};
    categoryList.forEach((c, i) => {
      nextObj[i] = [];
      const finishList = finishes.filter(f => f.category === c);
      finishList.forEach((f,j) => nextObj[i].push(j));
    })
    setExpandedCards(nextObj);
  };

  const collapseAllDetails = () => {
    const nextObj = {};
    categoryList.forEach((c, i) => {
      nextObj[i] = [];
    })
    setExpandedCards(nextObj);
  }

  
  return (
    <TabContextController categoryList={categoryList}>
      <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        <div className="controls" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <a onClick={expandAllCategories}>Expand All Categories</a><br />
          <a onClick={collapseAllCategories}>Close All Categories</a><br />
          <a onClick={expandAllDetails}>Expand All Details</a><br />
          <a onClick={collapseAllDetails}>Close All Details</a><br />
        </div>
        {(categoryList || []).map((category, i) => (
          <FinishCategoryTable
            key={category}
            category={category}
            finishes={finishes.filter(f => f.category === category)}
            expandedCategory={!expandedCategories || expandedCategories.includes(i)}
            expandedChildren={expandedCards[i] || []}
            handleExpandedChildren={(updatedChildren) => setExpandedCards(prev => ({ ...prev, [i]: updatedChildren }))}
            toggleExpandCategory={() => toggleExpandCategory(i)}
          />
        ))}
      </section>
  </TabContextController>
  )
}

export default FinishCategoriesTable
