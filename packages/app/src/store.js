import { createStore, compose, applyMiddleware } from 'redux';
import { reducer } from './modules';

const createTasketStore = () => {
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(reducer, {}, composeEnhancers(applyMiddleware()));
  return store;
};

export default createTasketStore;
