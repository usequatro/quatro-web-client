import { configureStore } from '@reduxjs/toolkit';

import * as apiClient from './utils/apiClient';
import mixpanelInstance from './utils/mixpanelInstance';

import taskSlice from './modules/tasks';
import recurringConfigsSlice from './modules/recurringConfigs';
import dashboardSlice from './modules/dashboard';
import sessionSlice from './modules/session';
import taskFormSlice from './modules/taskForm';
import registrationSlice from './modules/registration';
import calendarsSlice from './modules/calendars';
import calendarEventsSlice from './modules/calendarEvents';
import userExternalConfigSlice from './modules/userExternalConfig';

export default () => {
  const store = configureStore({
    devTools: Boolean(process.env.REACT_APP_DEVELOPMENT),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { apiClient, mixpanel: mixpanelInstance },
        },
      }),
    reducer: {
      [dashboardSlice.name]: dashboardSlice.reducer,
      [taskSlice.name]: taskSlice.reducer,
      [recurringConfigsSlice.name]: recurringConfigsSlice.reducer,
      [calendarsSlice.name]: calendarsSlice.reducer,
      [calendarEventsSlice.name]: calendarEventsSlice.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
      [taskFormSlice.name]: taskFormSlice.reducer,
      [userExternalConfigSlice.name]: userExternalConfigSlice.reducer,
      [registrationSlice.name]: registrationSlice.reducer,
    },
  });

  if (process.env.REACT_APP_DEVELOPMENT) {
    window.store = store;
  }
  return store;
};
