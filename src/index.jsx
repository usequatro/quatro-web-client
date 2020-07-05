import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './initializeFirebase';

import createStore from './store';
import App from './components/App';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
