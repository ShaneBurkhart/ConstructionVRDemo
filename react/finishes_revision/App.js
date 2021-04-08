import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ActionCreators from './action_creators';
import { finishCategoriesArr } from '../../common/constants';

import FloatingProjectButton from '../components/FloatingProjectButton';
import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import FinishCategoriesTable from './FinishCategoriesTable';

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

  const categoryList = finishCategoriesArr.map(({name}) => name).filter(c => Object.keys(activeCategoryMap).includes(c));

  return (
    <main>
      {adminMode && <FinishCategoriesDrawer activeCategoryMap={activeCategoryMap} categoryList={categoryList} />}
      <FinishCategoriesTable finishes={finishes} categoryList={categoryList} adminMode={adminMode} />
      <FloatingProjectButton name={PROJECT_NAME} />
      <ToastMessage positive={false} message={apiError.message} />
    </main>
  );
}

export default App;
