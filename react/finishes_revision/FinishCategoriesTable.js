import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'underscore';
import FinishCategoryTable from './FinishCategoryTable';
import { finishCategoriesMap } from '../../common/constants';

function FinishCategoriesTable({ finishes, categoryList, adminMode }) {
  const newestFinish = useSelector(state => state.newestFinish);

  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [focusedEl, setFocusedEl] = useState(null);

  const toggleExpandCategory = (category) => {
    if (!expandedCategories.hasOwnProperty(category)){
      return setExpandedCategories(prev => ({ ...prev, [category]: false }));
    }
    return setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  }

  const expandAllCategories = () => {
    const nextState = {};
    categoryList.forEach(category => nextState[category] = true);
    setExpandedCategories(nextState);
  }

  const collapseAllCategories = () => {
    setFocusedEl(null);
    const nextState = {};
    categoryList.forEach(category => nextState[category] = false);
    setExpandedCategories(nextState)
  };

  const expandAllDetails = () => {
    expandAllCategories();
    const nextState = {};
    categoryList.forEach(category => {
      nextState[category] = {};
      const finishList = finishes.filter(f => f.category === category);
      finishList.forEach(f => nextState[category][f.id] = true);
    })
    setExpandedCards(nextState);
  };

  const collapseAllDetails = () => {
    setFocusedEl(null);
    const nextState = {};
    categoryList.forEach(category => {
      nextState[category] = {};
      const finishList = finishes.filter(f => f.category === category);
      finishList.forEach(f => nextState[category][f.id] = false);
    })
    setExpandedCards(nextState);
  }

  const expandCategory = (category) => setExpandedCategories(prev => ({ ...prev, [category]: true }));
  
  const expandCard = (category, cardId) => {
    if (!expandedCards[category]) {
      setExpandedCards(prev => ({ ...prev, [category]: { [cardId]: true }}))
    } else {
      if (!expandedCards[category][cardId]) setExpandedCards(prev => (
        { ...prev, [category]: { ...prev[category], [cardId]: true }}
      ))
    };
  }

  useEffect(() => {
    if (!_.isEmpty(newestFinish)) {
      const category = newestFinish.category;
      expandCategory(category);
    }
  }, [newestFinish]);

  const tabToPrevCategory = (category, cardId) => {
    if (!expandedCategories[category]) expandCategory(category);
    expandCard(category, cardId);
    const excludedDetails = ["Images"];
    const attrListLength = finishCategoriesMap[category].attr.length - 1;
    const lastFieldIdx = attrListLength - excludedDetails.length;
    setFocusedEl([category, cardId, lastFieldIdx]);
  }

  const tabToNextCategory = (category, cardId) => {
    if (!expandedCategories[category]) expandCategory(category);
    expandCard(category, cardId);
    setFocusedEl([category, cardId, -1]);
  }

  const controls = [
    [expandAllCategories, "Expand All Categories"],
    [collapseAllCategories, "Collapse All Categories"],
    [expandAllDetails, "Expand All Details"],
    [collapseAllDetails, "Collapse All Details"],
  ]

  const sortedCategories = categoryList || [];
  
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
        {sortedCategories.map((category, i) => {
          const prevCat = i === 0 ? "" : sortedCategories[i - 1];
          const nextCat = i === (sortedCategories.length - 1) ? "" : sortedCategories[i + 1];
          const prevCatList = (finishes || []).filter(f => f.category === prevCat);
          const prevCatLastCardId = (prevCatList[prevCatList.length - 1] || {}).id;
          const nextCatList = finishes.filter(f => f.category === nextCat);
          const nextCatFirstCardId = nextCatList.length && nextCatList[0].id;
          return (
            <FinishCategoryTable
              key={category}
              category={category}
              focusedEl={focusedEl}
              setFocusedEl={setFocusedEl}
              finishes={finishes.filter(f => f.category === category)}
              expandedCategory={!expandedCategories.hasOwnProperty(category) || expandedCategories[category]}
              expandedChildren={expandedCards[category] || {}}
              updateExpandedChildren={(updatedChildren) => setExpandedCards(prev => ({ ...prev, [category]: updatedChildren }))}
              toggleExpandCategory={() => toggleExpandCategory(category)}
              tabToPrevCategory={() => tabToPrevCategory(prevCat, prevCatLastCardId)}
              tabToNextCategory={() => tabToNextCategory(nextCat, nextCatFirstCardId)}
            />
          );
        })}
      </section>
  )
}

export default FinishCategoriesTable
