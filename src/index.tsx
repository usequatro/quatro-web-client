import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './loadFirebase';

import createStore from './store';
import App from './components/App';

const store = createStore();

/* eslint-disable react/jsx-filename-extension */
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
