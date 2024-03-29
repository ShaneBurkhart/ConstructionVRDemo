import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import ActionCreators from './action_creators';
import { finishCategoriesArr } from '../../common/constants';

import FilePanel from './FilePanel';
import SiteHeader from './SiteHeader';
import FinishCategoriesTable from './FinishCategoriesTable';
import SideDrawer from './SideDrawer';
import ShareLinkModal from './modals/ShareLinkModal';
import PrintOptionsModal from './modals/PrintOptionsModal';

import ToastMessage from '../components/ToastMessage';

import "finishvision-tailwind";
import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const adminMode = IS_SUPER_ADMIN || IS_EDITOR;
  const plans = useSelector(state => state.plans);
  const _finishes = useSelector(state => state.finishes) || [];
  const apiError = useSelector(state => state.apiError);

  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const toggleShareLinkModal = () => setShowShareLinkModal(!showShareLinkModal);
  const togglePrintOptionsModal = () => setShowPrintOptionsModal(!showPrintOptionsModal);

  const onSubmitPrintOptions = () => {
    setShowPrintOptionsModal(false);
    setTimeout(() => window.print(), 0);
  }

  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  let finishes = _finishes;
  const q = searchQuery.trim().toLowerCase();
  if (!!q) {
    finishes = finishes.filter(f => f.displayName.toLowerCase().includes(q));
  }

  const noSearchResults = !!_finishes.length && !finishes.length;

  const activeCategoryMap = {};
  finishes.forEach(({category}) => {
    if (category) {
      if (!activeCategoryMap[category]) activeCategoryMap[category] = 0;
      activeCategoryMap[category]++
    }
  });

  const categoryList = finishCategoriesArr.map(c => c.name).filter(c => Object.keys(activeCategoryMap).includes(c));
  
  const planHistories = plans.filter(p => !!(p.PlanHistories || []).length).map(p => p.PlanHistories).flat();
  const planDocs = [
    ...plans.filter(p => !!p.Document).map(p => ({ PlanId: p.id, ...p.Document })),
    ...planHistories.filter(p => !!p.Document).map(p => ({ PlanId: p.PlanId, isHistory: true, ...p.Document }))
  ];
  
  return (
    <main>
      <Router>
        {adminMode && (
          <SideDrawer
            plans={plans}
            searchQuery={searchQuery}
            planDocs={planDocs}
            categoryList={categoryList}
            activeCategoryMap={activeCategoryMap}
            noSearchResults={noSearchResults}
            clearSearchQuery={() => setSearchQuery('')}
          />
        )}
        <div className={`${adminMode ? "admin-mode" : ""}`}>
          <SiteHeader
            adminMode={adminMode}
            categoryList={categoryList}
            toggleShareLinkModal={toggleShareLinkModal}
            togglePrintOptionsModal={togglePrintOptionsModal}
          />
          <Switch>
            <Route exact path={`/app/project/${PROJECT_ACCESS_TOKEN}/finishes`}>
              <FinishCategoriesTable
                finishes={finishes}
                categoryList={categoryList}
                adminMode={adminMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                noSearchResults={noSearchResults}
              />
            </Route>
            <Route path={`/app/project/${PROJECT_ACCESS_TOKEN}/finishes/files`} component={FilePanel} />
          </Switch>
        </div>
      </Router>
      {showShareLinkModal && (
        <ShareLinkModal onClose={toggleShareLinkModal} />
      )}
      {showPrintOptionsModal && (
        <PrintOptionsModal onClose={togglePrintOptionsModal} categoryList={categoryList} onSubmit={onSubmitPrintOptions} />
      )}
      <ToastMessage positive={false} message={apiError.message} />
    </main>
  );
}

export default App;
