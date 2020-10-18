import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga'
import { reducer, sagas } from './modules';
import * as apiClient from './utils/apiClient';
import mixpanelInstance from './utils/mixpanelInstance';

export default () => {
  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducer,
    {},
    composeEnhancers(
      applyMiddleware(
        thunk.withExtraArgument({ apiClient, mixpanel: mixpanelInstance }),
        sagaMiddleware,
      ),
    ),
  );
  sagaMiddleware.run(sagas);
  if (process.env.REACT_APP_DEVELOPMENT) {
    window.store = store;
  }
  return store;
};
