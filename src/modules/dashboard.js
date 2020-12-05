/**
 * Basic app state for views, like which view shows, if side menus are open, etc.
 */
import once from 'lodash/once';
import createReducer from '../utils/createReducer';
import { listenToTaskList, selectTaskDashboardTab, getTabProperties } from './tasks';
import { listenToRecurringConfigList } from './recurringConfigs';
import { selectUserId } from './session';
import { RESET } from './reset';
import { NOW } from '../constants/dashboardTabs';
import * as SOURCES from '../constants/taskSources';
import { TASK_CREATED } from '../constants/mixpanelEvents';

import * as apiClient from '../utils/apiClient';

export const NAMESPACE = 'dashboard';

const INITIAL = 'initial';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

const IN_SYNC = 'inSync';
const OUT_OF_SYNC = 'outOfSync';

// Action types

const SET_STATUS = `${NAMESPACE}/SET_STATUS`;
const SET_ACCOUNT_MENU_OPEN = `${NAMESPACE}/SET_ACCOUNT_MENU_OPEN`;
const SET_SNACKBAR_DATA = `${NAMESPACE}/SET_SNACKBAR_DATA`;
const RESET_SNACKBAR = `${NAMESPACE}/RESET_SNACKBAR`;
const SET_ACTIVE_TAB = `${NAMESPACE}/SET_ACTIVE_TAB`;
const HIGHLIGH_TASK = `${NAMESPACE}/HIGHLIGH_TASK`;
const SET_TASKS_LISTENER_STATUS = `${NAMESPACE}/SET_TASKS_LISTENER_STATUS`;
const SET_RECURRING_CONFIGS_LISTENER_STATUS = `${NAMESPACE}/SET_RECURRING_CONFIGS_LISTENER_STATUS`;

// Reducers

const INITIAL_STATE = {
  status: INITIAL,
  accountMenuOpen: false,
  activeTab: NOW,
  highlightedTaskId: null,
  tasksSyncStatus: IN_SYNC,
  recurringConfigsSyncStatus: IN_SYNC,
  snackbarData: {
    open: false,
    message: '',
    id: null,
    buttonText: '',
    buttonAction: null,
    buttonLink: null,
  },
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_STATUS]: (state, { payload }) => ({
    ...state,
    status: payload,
  }),
  [SET_ACCOUNT_MENU_OPEN]: (state, { payload: accountMenuOpen }) => ({
    ...state,
    accountMenuOpen,
  }),
  [SET_SNACKBAR_DATA]: (state, { payload: snackbarData }) => ({
    ...state,
    snackbarData,
  }),
  [RESET_SNACKBAR]: (state) => ({
    ...state,
    snackbarData: INITIAL_STATE.snackbarData,
  }),
  [SET_ACTIVE_TAB]: (state, { payload }) => ({ ...state, activeTab: payload }),
  [HIGHLIGH_TASK]: (state, { payload }) => ({ ...state, highlightedTaskId: payload }),
  [SET_TASKS_LISTENER_STATUS]: (state, { payload }) => ({ ...state, tasksSyncStatus: payload }),
  [SET_RECURRING_CONFIGS_LISTENER_STATUS]: (state, { payload }) => ({
    ...state,
    recurringConfigsSyncStatus: payload,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectDashboadIsLoading = (state) => state[NAMESPACE].status === LOADING;
export const selectDashboadIsLoaded = (state) => state[NAMESPACE].status === LOADED;
export const selectAccountMenuOpen = (state) => state[NAMESPACE].accountMenuOpen;
export const selectSnackbarData = (state) => state[NAMESPACE].snackbarData;
export const selectDashboardActiveTab = (state) => state[NAMESPACE].activeTab;
export const selectHighlightedTaskId = (state) => state[NAMESPACE].highlightedTaskId;

export const selectIsDataInSync = (state) =>
  state[NAMESPACE].tasksSyncStatus === IN_SYNC &&
  state[NAMESPACE].recurringConfigsSyncStatus === IN_SYNC;

// Actions

export const setAccountMenuOpen = (accountMenuOpen) => ({
  type: SET_ACCOUNT_MENU_OPEN,
  payload: accountMenuOpen,
});

export const setSnackbarData = (snackbarData) => ({
  type: SET_SNACKBAR_DATA,
  payload: snackbarData,
});

export const resetSnackbar = (snackbarData) => ({
  type: RESET_SNACKBAR,
  payload: snackbarData,
});

export const setDashboardActiveTab = (tab) => ({
  type: SET_ACTIVE_TAB,
  payload: tab,
});

const setStatus = (status) => ({
  type: SET_STATUS,
  payload: status,
});

export const listenToDashboardTasks = () => (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[tasks:listenToDashboardTasks] No userId');
  }

  dispatch(setStatus(LOADING));

  const errorCallback = () => {
    dispatch(setStatus(ERROR));
  };

  // Preparing snapshot listener callbacks to update initial dashboard loading state and dispatches
  // changes to the flag that tracks if the local changes are persisted
  const { tasksNextCallback, recurringConfigsNextCallback } = (() => {
    const flags = { tasks: false, recurringConfigs: false };
    const dispatchLoaded = once(() => dispatch(setStatus(LOADED)));
    const dispatchLoadedIfReady = () => {
      if (flags.tasks && flags.recurringConfigs) {
        dispatchLoaded();
      }
    };
    return {
      tasksNextCallback: (hasUnsavedChanges) => {
        flags.tasks = true;
        dispatch({
          type: SET_TASKS_LISTENER_STATUS,
          payload: hasUnsavedChanges ? OUT_OF_SYNC : IN_SYNC,
        });
        dispatchLoadedIfReady();
      },
      recurringConfigsNextCallback: (hasUnsavedChanges) => {
        flags.recurringConfigs = true;
        dispatch({
          type: SET_RECURRING_CONFIGS_LISTENER_STATUS,
          payload: hasUnsavedChanges ? OUT_OF_SYNC : IN_SYNC,
        });
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
  dispatch({ type: HIGHLIGH_TASK, payload: id });
  setTimeout(() => {
    dispatch({ type: HIGHLIGH_TASK, payload: null });
  }, 1500);
};

/**
 * @param {string} title
 * @param {number} impact
 * @param {number} effort
 * @param {Object} [params]
 * @param {string} [params.description]
 * @param {Date} [params.due]
 * @param {Date} [params.scheduledStart]
 * @returns {Promise<string>} - Promise resolving with the new task ID
 */
export const createTask = (
  title,
  impact,
  effort,
  { description, due, scheduledStart, blockedBy } = {},
) => (dispatch, getState, { mixpanel }) => {
  const state = getState();
  const userId = selectUserId(state);

  const task = {
    title,
    impact,
    effort,
    description,
    due,
    scheduledStart,
    blockedBy,
    userId,
    created: Date.now(),
    source: SOURCES.USER,
  };
  const showSnackbar = (tid) => {
    const stateTask = getState();
    const tabTask = selectTaskDashboardTab(stateTask, tid);
    const dashboardActiveTab = selectDashboardActiveTab(state);

    const selectTab = getTabProperties(tabTask);
    dispatch(
      setSnackbarData({
        open: true,
        message: `Task created`,
        id: tid,
        // Show button only if task went to a different tab than what's visible now
        ...(dashboardActiveTab !== tabTask
          ? { buttonText: `See ${selectTab.text}`, buttonLink: selectTab.link }
          : {}),
      }),
    );
  };

  return apiClient.fetchCreateTask(task).then(({ id }) => {
    showSnackbar(id, task);
    mixpanel.track(TASK_CREATED, {
      hasBlockers: blockedBy.length > 0,
      hasScheduledStart: !!scheduledStart,
      hasDueDate: !!due,
    });

    return id;
  });
};
