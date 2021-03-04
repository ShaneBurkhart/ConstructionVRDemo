import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from "react-router-dom";
import { useDispatch } from 'react-redux';

import ActionCreators from './action_creators';


import Header from '../components/Header';
import Dashboard from './Dashboard';
import UsersPanel from './UsersPanel';
import EditUser from './EditUser';

const NoRoute = () => {
  return <Redirect to="/" />;
};


const App = () => {
  const dispatch = useDispatch();

  const isAdmin = window.hasOwnProperty('IS_SUPER_ADMIN') && IS_SUPER_ADMIN;
  
  useEffect(() => {
    ActionCreators.updateDispatch(dispatch);
    ActionCreators.load();
  }, []);

  return (
    <>
      <Header />
      <main className="large-container">
        <Router>
          <Switch>
            <Route exact path="/app/dashboard" component={Dashboard} />
            {isAdmin && (
              <>
              <Route path="/app/admin/users-panel" component={UsersPanel} />
              <Route path="/app/admin/users/:id" component={EditUser} />
              </>
            )}
            <Route component={NoRoute} />
          </Switch>
        </Router>
      </main>
    </>
  );
}

export default App;
