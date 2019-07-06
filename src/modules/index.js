import { combineReducers } from 'redux';
import { reducer as tasksReducer, NAMESPACE as tasksNamespace } from './tasks';
import { reducer as notificationReducer, NAMESPACE as notificationNamespace } from './notification';
import { reducer as dashboardReducer, NAMESPACE as dashboardNamespace } from './dashboard';


// eslint-disable-next-line import/prefer-default-export
export const reducer = combineReducers({
  [dashboardNamespace]: dashboardReducer,
  [tasksNamespace]: tasksReducer,
  [notificationNamespace]: notificationReducer,
});
