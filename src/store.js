import { createStore, compose, applyMiddleware } from 'redux';
import get from 'lodash/get';
import thunk from 'redux-thunk';
import * as firebase from 'firebase/app';
import { reducer } from './modules';

export default () => {
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducer,
    {},
    composeEnhancers(
      applyMiddleware(thunk.withExtraArgument({
        getLoggedInUserUid: () => get(firebase.auth().currentUser, 'uid'),
      })),
    ),
  );
  return store;
};
