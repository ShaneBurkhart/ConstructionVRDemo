import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import store from './store';

import 'semantic-ui-css/semantic.min.css';
import './index.css';

import App from './App';

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('renderer-uploader-app'));
