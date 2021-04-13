import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ActionCreators from './action_creators';
import { finishCategoriesArr } from '../../common/constants';

import FinishCategoriesDrawer from './FinishCategoriesDrawer';
import FinishCategoriesTable from './FinishCategoriesTable';
import SiteHeader from './SiteHeader';

import ToastMessage from '../components/ToastMessage';

import "./FinishSelectionTable.css";


const App = () => {
  const dispatch = useDispatch();
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  const finishes = useSelector(state => state.finishes);
  const apiError = useSelector(state => state.apiError);
  const projectName = useSelector(state => state.projectName);

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
      <div className={`${adminMode ? "admin-mode" : ""}`}>
        <SiteHeader projectName={projectName} />
        <FinishCategoriesTable finishes={finishes} categoryList={categoryList} adminMode={adminMode} />
      </div>
      <ToastMessage positive={false} message={apiError.message} />
    </main>
  );
}

export default App;
