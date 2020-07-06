import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './firebase';

import createStore from './store';
import App from './components/App';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// app info for debugging
window.quatro = {
  buildEnv: process.env.NODE_ENV,
  appEnv: process.env.REACT_APP_DEVELOPMENT ? 'development' : 'production',
};
