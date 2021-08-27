import React, { useContext, Suspense } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';

// const HomeApp = React.lazy(() => import('./project/ProjectApp'));

import { FullPageLoadingSpinner } from './components/LoadingSpinner';
import Home from './pages/Home'
import Document from './pages/Document'

const NoRoute = () => <Redirect to="/" />;

const App = () => {
  return (
    <Suspense fallback={<FullPageLoadingSpinner />}>
      <Switch>
        <Route exact path="/app/document" component={Home} />
        <Route path="/app/document/:documentUuid" component={Document} />
        <Route component={NoRoute} />
      </Switch>
    </Suspense>
  );
};

export default App;