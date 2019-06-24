import { combineReducers } from 'redux';
import { reducer as tasksReducer, NAMESPACE as tasksNamespace } from './tasks';
import { reducer as notificationReducer, NAMESPACE as notificationNamespace } from './notification';

// eslint-disable-next-line import/prefer-default-export
export const reducer = combineReducers({
  [tasksNamespace]: tasksReducer,
  [notificationNamespace]: notificationReducer,
});
