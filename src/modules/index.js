import { combineReducers } from 'redux';
import { reducer as tasksReducer, namespace as tasksNamespace } from './tasks';
import {
  reducer as recurringConfigsReducer,
  namespace as recurringConfigsNamespace,
} from './recurringConfigs';
import { reducer as dashboardReducer, NAMESPACE as dashboardNamespace } from './dashboard';
import { reducer as googleCalendarReducer, NAMESPACE as googleCalendardNamespace } from './googleCalendar';
import { reducer as sessionReducer, NAMESPACE as sessionNamespace } from './session';
import { reducer as taskFormReducer, NAMESPACE as taskFormNamespace } from './taskForm';
import { reducer as registrationReducer, NAMESPACE as registrationNamespace } from './registration';

// eslint-disable-next-line import/prefer-default-export
export const reducer = combineReducers({
  [dashboardNamespace]: dashboardReducer,
  [googleCalendardNamespace]: googleCalendarReducer,
  [tasksNamespace]: tasksReducer,
  [recurringConfigsNamespace]: recurringConfigsReducer,
  [sessionNamespace]: sessionReducer,
  [taskFormNamespace]: taskFormReducer,
  [registrationNamespace]: registrationReducer,
});
