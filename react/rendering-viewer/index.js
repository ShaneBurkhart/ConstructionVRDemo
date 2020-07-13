import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux'
import store from './store'
import Actions from '../../common/actions'

import 'semantic-ui-css/semantic.min.css';
import './index.css';

import App from './App';

store.dispatch({ type: Actions.LOAD, data: window.DATA });

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('rendering-viewer'));
