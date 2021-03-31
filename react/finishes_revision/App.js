import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'underscore';
import ActionCreators from './action_creators';

import FloatingProjectButton from '../components/FloatingProjectButton';
import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import FinishCategoryTable from './FinishCategoryTable';

import ToastMessage from '../components/ToastMessage';

import "./FinishSelectionTable.css";


const App = () => {
  const dispatch = useDispatch();
  const adminMode = useSelector(state => state.adminMode);
  const finishes = useSelector(state => state.finishes);
  const apiError = useSelector(state => state.apiError);

  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  const activeCategoryMap = {};
  finishes.forEach(({category}) => {
    if (category) {
      if (!activeCategoryMap[category]) activeCategoryMap[category] = 0;
      activeCategoryMap[category]++
    }
  });

  return (
    <main>
      {adminMode && <FinishCategoriesDrawer activeCategoryMap={activeCategoryMap} />}
      <section className={`xlarge-container ${adminMode ? 'admin-mode' : ''}`}>
        {(Object.keys(activeCategoryMap).sort() || []).map(category => (
          <FinishCategoryTable
            key={category}
            category={category}
            finishes={finishes.filter(f => f.category === category)}
          />
        ))}
      </section>
      <FloatingProjectButton name={PROJECT_NAME} />
      <ToastMessage positive={false} message={apiError.message} />
    </main>
  );
}

export default App;
