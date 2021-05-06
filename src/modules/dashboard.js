import once from 'lodash/once';
import { createSlice } from '@reduxjs/toolkit';
import startOfDay from 'date-fns/startOfDay';
import startOfMinute from 'date-fns/startOfMinute';

import { listenToTaskList, selectTaskDashboardTab } from './tasks';
import { listenToRecurringConfigList } from './recurringConfigs';
import { selectUserId } from './session';
import { NOW } from '../constants/dashboardTabs';
import * as dashboardTabs from '../constants/dashboardTabs';
import * as paths from '../constants/paths';

import * as apiClient from '../utils/apiClient';

const name = 'dashboard';

const INITIAL = 'initial';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

const IN_SYNC = 'inSync';
const OUT_OF_SYNC = 'outOfSync';

// Selectors

export const selectDashboadIsLoading = (state) => state[name].status === LOADING;
export const selectDashboadIsLoaded = (state) => state[name].status === LOADED;
export const selectDashboardActiveTab = (state) => state[name].activeTab;
export const selectHighlightedTaskId = (state) => state[name].highlightedTaskId;
export const selectCalendarDisplayTimestamp = (state) => state[name].calendarDisplayTimestamp;
export const selectCurrentTimestamp = (state) => state[name].currentTimestamp;

export const selectIsDataInSync = (state) =>
  state[name].tasksSyncStatus === IN_SYNC && state[name].recurringConfigsSyncStatus === IN_SYNC;

// Slice

const initialState = {
  status: INITIAL,
  activeTab: NOW,
  highlightedTaskId: null,
  tasksSyncStatus: IN_SYNC,
  recurringConfigsSyncStatus: IN_SYNC,
  // current date showing in the calendar view
  calendarDisplayTimestamp: startOfDay(new Date()).getTime(),
  // current time, accurate to the minute. Used to refresh react-redux selectors
  currentTimestamp: startOfMinute(new Date()).getTime(),
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setDashboardActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    highlightTask: (state, { payload }) => {
      state.highlightedTaskId = payload;
    },
    setTasksListenerStatus: (state, { payload }) => {
      state.tasksSyncStatus = payload;
    },
    setRecurringConfigsListenerStatus: (state, { payload }) => {
      state.recurringConfigsSyncStatus = payload;
    },
    setCalendarDisplayTimestamp: (state, { payload }) => {
      state.calendarDisplayTimestamp = startOfDay(payload).getTime();
    },
    refreshCurrentTimestamp: (state, { payload: timestamp = Date.now() }) => {
      const currentTimestamp = startOfMinute(timestamp).getTime();
      if (state.currentTimestamp !== currentTimestamp) {
        state.currentTimestamp = currentTimestamp;
      }
    },
  },
});
/* eslint-enable no-param-reassign */

export default slice;
export const {
  setDashboardActiveTab,
  setCalendarDisplayTimestamp,
  refreshCurrentTimestamp,
} = slice.actions;

// Thunks

export const listenToDashboardTasks = () => (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[tasks:listenToDashboardTasks] No userId');
  }

  dispatch(slice.actions.setStatus(LOADING));

  const errorCallback = () => {
    dispatch(slice.actions.setStatus(ERROR));
  };

  // Preparing snapshot listener callbacks to update initial dashboard loading state and dispatches
  // changes to the flag that tracks if the local changes are persisted
  const { tasksNextCallback, recurringConfigsNextCallback } = (() => {
    const flags = { tasks: false, recurringConfigs: false };
    const dispatchLoaded = once(() => dispatch(slice.actions.setStatus(LOADED)));
    const dispatchLoadedIfReady = () => {
      if (flags.tasks && flags.recurringConfigs) {
        dispatchLoaded();
      }
    };
    return {
      tasksNextCallback: (hasUnsavedChanges) => {
        flags.tasks = true;
        dispatch(slice.actions.setTasksListenerStatus(hasUnsavedChanges ? OUT_OF_SYNC : IN_SYNC));
        dispatchLoadedIfReady();
      },
      recurringConfigsNextCallback: (hasUnsavedChanges) => {
        flags.recurringConfigs = true;
        dispatch(
          slice.actions.setRecurringConfigsListenerStatus(
            hasUnsavedChanges ? OUT_OF_SYNC : IN_SYNC,
          ),
        );
        dispatchLoadedIfReady();
      },
    };
  })();

  const unsubscribeTaskList = dispatch(listenToTaskList(userId, tasksNextCallback, errorCallback));
  const unsubscribeRecurringConfigList = dispatch(
    listenToRecurringConfigList(userId, recurringConfigsNextCallback, errorCallback),
  );

  return () => {
    unsubscribeTaskList();
    unsubscribeRecurringConfigList();
  };
};

export const setHighlighedTask = (id) => (dispatch) => {
  dispatch(slice.actions.highlightTask(id));
  setTimeout(() => {
    dispatch(slice.actions.highlightTask(null));
  }, 1500);
};

const tabTextAndLink = {
  [dashboardTabs.NOW]: {
    text: dashboardTabs.NOW,
    link: paths.NOW,
  },
  [dashboardTabs.BACKLOG]: {
    text: dashboardTabs.BACKLOG,
    link: paths.BACKLOG,
  },
  [dashboardTabs.SCHEDULED]: {
    text: dashboardTabs.SCHEDULED,
    link: paths.SCHEDULED,
  },
  [dashboardTabs.BLOCKED]: { text: dashboardTabs.BLOCKED, link: paths.BLOCKED },
};

/**
 * @param {string} title
 * @param {number} impact
 * @param {number} effort
 * @param {Object} [params]
 * @param {string} [params.description]
 * @param {Date} [params.due]
 * @param {Date} [params.scheduledStart]
 * @param {string} [params.calendarBlockCalendarId]
 * @param {number} [params.calendarBlockStart]
 * @param {number} [params.calendarBlockEnd]
 * @returns {Promise<string>} - Promise resolving with the new task ID
 */
export const createTask = (
  title,
  impact,
  effort,
  {
    description,
    due,
    scheduledStart,
    snoozedUntil,
    blockedBy,
    calendarBlockCalendarId,
    calendarBlockProviderCalendarId,
    calendarBlockStart,
    calendarBlockEnd,
  } = {},
  callback = () => {},
) => (_, getState) => {
  const state = getState();
  const userId = selectUserId(state);

  const task = {
    title,
    impact,
    effort,
    description,
    due,
    scheduledStart,
    snoozedUntil,
    blockedBy,
    calendarBlockCalendarId,
    calendarBlockProviderCalendarId,
    calendarBlockStart,
    calendarBlockEnd,
  };

  return apiClient.fetchCreateTask(userId, task).then(({ id }) => {
    const stateTask = getState();
    const tabTask = selectTaskDashboardTab(stateTask, id);
    const isSameTab = tabTask === selectDashboardActiveTab(state);

    const { text, link } = tabTextAndLink[tabTask] || tabTextAndLink[dashboardTabs.NOW];

    callback({
      id,
      task,
      notificationButtonText: isSameTab ? '' : `See ${text}`,
      notificationButtonLink: isSameTab ? '' : link,
    });

    return id;
  });
};
