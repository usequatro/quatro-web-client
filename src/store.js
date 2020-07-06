import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer } from './modules';
import * as apiClient from './util/apiClient';

export default () => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducer,
    {},
    composeEnhancers(
      applyMiddleware(
        thunk.withExtraArgument({ apiClient }),
      ),
    ),
  );
  if (process.env.REACT_APP_DEVELOPMENT) {
    window.store = store;
  }
  return store;
};
