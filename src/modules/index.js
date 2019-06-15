import { combineReducers } from 'redux';
import { reducer as tasksReducer, NAMESPACE as tasksNamespace } from './tasks';

// eslint-disable-next-line import/prefer-default-export
export const reducer = combineReducers({
  [tasksNamespace]: tasksReducer,
});
