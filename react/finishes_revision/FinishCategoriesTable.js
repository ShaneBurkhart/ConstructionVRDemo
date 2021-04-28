import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'underscore';
import FinishCategoryTable from './FinishCategoryTable';
import FloatingProjectButton from '../components/FloatingProjectButton';
import { getInlineEditableAttrList } from '../../common/constants';

function FinishCategoriesTable({ finishes, categoryList, adminMode }) {
  const newestFinish = useSelector(state => state.newestFinish);
  const projectName = useSelector(state => state.projectName);

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

  const sortedCategories = categoryList || [];
  const getSortedCategoryCards = category => (finishes || [])
      .filter(f => f.category === category)
        .sort((a,b) => a.orderNumber - b.orderNumber);

  const tabToPrevCategory = (prevCat) => {
    if (!prevCat) return;
    const lastCard = getSortedCategoryCards(prevCat).pop();
    if (!lastCard) return;

    if (!expandedCategories[prevCat]) expandCategory(prevCat);
    expandCard(prevCat, lastCard.id);

    const editableAttrList = getInlineEditableAttrList(prevCat);
    const lastAttr = editableAttrList[editableAttrList.length - 1];
    setFocusedEl([prevCat, lastCard.id, lastAttr]);
  }

  const tabToNextCategory = (nextCat) => {
    if (!nextCat) return;
    const firstCard = getSortedCategoryCards(nextCat)[0];
    if (!firstCard) return;
    
    if (!expandedCategories[nextCat]) expandCategory(nextCat);
    expandCard(nextCat, firstCard.id);

    const editableAttrList = getInlineEditableAttrList(nextCat);
    const firstAttr = editableAttrList[0];
    setFocusedEl([nextCat, firstCard.id, firstAttr]);
  }

  const controls = [
    [expandAllCategories, "Expand All Categories"],
    [collapseAllCategories, "Collapse All Categories"],
    [expandAllDetails, "Expand All Details"],
    [collapseAllDetails, "Collapse All Details"],
  ]

  
  return (
    <>
      <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        {sortedCategories.map((category, i) => {
          const prevCat = i === 0 ? "" : sortedCategories[i - 1];
          const nextCat = i === (sortedCategories.length - 1) ? "" : sortedCategories[i + 1];

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
              tabToPrevCategory={() => tabToPrevCategory(prevCat)}
              tabToNextCategory={() => tabToNextCategory(nextCat, nextCatFirstCardId)}
            />
          );
        })}
      </section>
      <FloatingProjectButton name={projectName} options={controls} />
    </>
  )
}

export default FinishCategoriesTable;
