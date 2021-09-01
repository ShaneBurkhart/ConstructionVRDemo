import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'underscore';
import FinishCategoryTable from './FinishCategoryTable';
import FloatingProjectButton from '../components/FloatingProjectButton';
import { getInlineEditableAttrList } from '../../common/constants';
import { SearchIcon } from '@heroicons/react/outline';


const CustomInputWrapper = ({ children }) => (
  <div className="relative flex items-center p-1 px-2 py-0 mt-2 leading-6 border border-gray-400 rounded xs:mt-0 max-w-max focus-within:ring-blue-600 focus-within:ring-1 focus-within:ring-offset-0 focus-within:border-blue-600 focus-within:ring-offset-white">
    {children}
  </div>
);

function FinishCategoriesTable({
  finishes,
  categoryList,
  adminMode,
  searchQuery,
  setSearchQuery,
  noSearchResults,
}) {
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
  ];

  
  return (
    <>
      <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        <div className="flex justify-end w-full mb-6">
          <CustomInputWrapper>
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} 
              style={{ width: 250 }}
              className="leading-5 text-black placeholder-gray-400 bg-transparent border-none focus:border-none focus:ring-0 focus:ring-offset-0"
              type="search" 
              placeholder="Search finishes..."
            /> 
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </CustomInputWrapper>
        </div>
        {noSearchResults && (
          <div className="px-4 py-2">                  
            <div className="font-medium tracking-wide">No finishes match search term "{searchQuery}"</div>
            <a className="block mt-2 text-blue-800 cursor-pointer" onClick={() => setSearchQuery('')}>Clear Search</a>
          </div>
        )}
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
