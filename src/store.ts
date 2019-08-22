import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer } from './modules';
import * as apiClient from './modules/apiClient';

export default () => {
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducer,
    {},
    composeEnhancers(
      applyMiddleware(thunk.withExtraArgument({
        apiClient,
      })),
    ),
  );
  return store;
};
