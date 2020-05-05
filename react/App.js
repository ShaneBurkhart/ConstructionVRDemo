import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { connect } from 'react-redux'
import * as _ from 'underscore';
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';

import FinishesPage from './FinishesPage';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    ActionCreators.updateDispatch(this.props.dispatch);
  }

  render() {
    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/finishes">Finishes</Link>
              </li>
              <li>
                <Link to="/users">Users</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/finishes">
              <FinishesPage />
            </Route>
            <Route path="/users">
            </Route>
            <Route path="/">
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default connect((reduxState, props) => {
  return { };
}, null)(App);
