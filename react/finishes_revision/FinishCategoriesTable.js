import React, { Fragment, useState, useEffect } from 'react';
import FinishCategoryTable from './FinishCategoryTable';
import { finishCategoriesMap } from '../../common/constants';

function FinishCategoriesTable({ finishes, categoryList, adminMode }) {
  const [expandedCategories, setExpandedCategories] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [focusedEl, setFocusedEl] = useState(null);

  const toggleExpandCategory = (idx) => {
    if (!expandedCategories) {
      const nextArr = [];
      categoryList.forEach((c,i) => { if (i !== idx) nextArr.push(i) });
      return setExpandedCategories(nextArr);
    };
    if (expandedCategories.includes(idx)) return setExpandedCategories([...expandedCategories].filter(i => i !== idx));
    return setExpandedCategories(prev => ([...prev, idx]));
  }

  const expandAllCategories = () => {
    const nextArr = [];
    categoryList.forEach((c, i) => nextArr.push(i));
    setExpandedCategories(nextArr);
  }

  const collapseAllCategories = () => {
    setFocusedEl(null);
    setExpandedCategories([]);
  };

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
    setFocusedEl(null);
    const nextObj = {};
    categoryList.forEach((c, i) => {
      nextObj[i] = [];
    })
    setExpandedCards(nextObj);
  }

  const expandCard = (key, newCard) => {
    if (expandedCards[key] && !expandedCards[key].includes(newCard)) return setExpandedCards(prev => ({ ...prev, [key]: [...prev[key], newCard] }));
    if (!expandedCards[key]) return setExpandedCards(prev => ({ ...prev, [key]: [newCard] }));
  }

  const expandCategory= (idx) => {
    if (!expandedCategories) return setExpandedCategories([idx]);
    if (!expandedCategories.includes(idx)) return setExpandedCategories(prev => [...prev, idx]);
  }

  useEffect(() => {
    if (expandedCategories) {
      const newestFinish = finishes[finishes.length - 1];
      const categoryIdx = categoryList.indexOf(newestFinish.category);
      if (newestFinish && !expandedCategories.includes(categoryIdx)) setExpandedCategories(prev => [...prev, categoryIdx]);
    }
  }, [finishes]);

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
    const prevCategoryCardLength = finishes.filter(f => f.category === prevCategory).length;
    const prevCategoryAttrLength = finishCategoriesMap[prevCategory].attr.length - 1;
    const excludedDetails = ["Name", "Images"];
    const lastAttrFieldIdx = prevCategoryAttrLength - excludedDetails.length;
    expandCategory(currentCatIdx - 1);
    expandCard(currentCatIdx - 1, prevCategoryCardLength - 1);
    setFocusedEl([prevCategory, prevCategoryCardLength - 1, lastAttrFieldIdx]);
  }

  const controls = [
    [expandAllCategories, "Expand All Categories"],
    [collapseAllCategories, "Collapse All Categories"],
    [expandAllDetails, "Expand All Details"],
    [collapseAllDetails, "Collapse All Details"],
  ]

  
  return (
    <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        <div className="controls" style={{ display: 'flex', justifyContent: 'flex-end', margin: "5px 0" }}>
          {controls.map(([action, label], i) => (
            <Fragment key={label}>
              <a style={{margin: "0px 4px"}} onClick={action}>{label}</a>
              {(i < controls.length - 1) && <span>{" "}-{" "}</span>}
            </Fragment>
          ))}
        </div>
        {(categoryList || []).map((category, i) => (
          <FinishCategoryTable
            key={category}
            category={category}
            focusedEl={focusedEl}
            setFocusedEl={setFocusedEl}
            finishes={finishes.filter(f => f.category === category)}
            expandedCategory={!expandedCategories || expandedCategories.includes(i)}
            expandedChildren={expandedCards[i] || []}
            updateExpandedChildren={(updatedChildren) => setExpandedCards(prev => ({ ...prev, [i]: updatedChildren }))}
            toggleExpandCategory={() => toggleExpandCategory(i)}
            tabToPrevCategory={() => tabToPrevCategory(category)}
            tabToNextCategory={() => tabToNextCategory(category)}
          />
        ))}
      </section>
  )
}

export default FinishCategoriesTable
