import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer } from './modules';
import * as apiClient from './utils/apiClient';
import mixpanelInstance from './utils/mixpanelInstance';

export default () => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducer,
    {},
    composeEnhancers(
      applyMiddleware(thunk.withExtraArgument({ apiClient, mixpanel: mixpanelInstance })),
    ),
  );
  if (process.env.REACT_APP_DEVELOPMENT) {
    window.store = store;
  }
  return store;
};
