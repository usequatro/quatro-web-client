/**
 * Basic app state for views, like which view shows, if side menus are open, etc.
 */

import createReducer from '../utils/createReducer';
import { loadTasks, addTask, selectTaskDashboardTab } from './tasks';
import { loadRecurringConfigs } from './recurringConfigs';
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

// Action types

const SET_STATUS = `${NAMESPACE}/SET_STATUS`;
const SET_ACCOUNT_MENU_OPEN = `${NAMESPACE}/SET_ACCOUNT_MENU_OPEN`;
const SET_SNACKBAR_DATA = `${NAMESPACE}/SET_SNACKBAR_DATA`;
const SET_ACTIVE_TAB = `${NAMESPACE}/SET_ACTIVE_TAB`;
const SET_NEW_TASK_DIALOG_OPEN = `${NAMESPACE}/SET_NEW_TASK_DIALOG_OPEN`;
const SET_EDIT_TASK_DIALOG_ID = `${NAMESPACE}/SET_EDIT_TASK_DIALOG_ID`;
const HIGHLIGH_TASK = `${NAMESPACE}/HIGHLIGH_TASK`;

// Reducers

const INITIAL_STATE = {
  status: INITIAL,
  accountMenuOpen: false,
  activeTab: NOW,
  newTaskDialogOpen: false,
  editTaskDialogId: null,
  highlightedTaskId: null,
  snackbarData: {open: false, id: null, task: null}
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
  [SET_ACTIVE_TAB]: (state, { payload }) => ({ ...state, activeTab: payload }),
  [SET_NEW_TASK_DIALOG_OPEN]: (state, { payload }) => ({ ...state, newTaskDialogOpen: payload }),
  [SET_EDIT_TASK_DIALOG_ID]: (state, { payload }) => ({ ...state, editTaskDialogId: payload }),
  [HIGHLIGH_TASK]: (state, { payload }) => ({ ...state, highlightedTaskId: payload }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectDashboadReadyForInitialFetch = (state) => state[NAMESPACE].status === INITIAL;
export const selectDashboadIsFetching = (state) => state[NAMESPACE].status === LOADING;
export const selectAccountMenuOpen = (state) => state[NAMESPACE].accountMenuOpen;
export const selectSnackbarData = (state) => state[NAMESPACE].snackbarData;
export const selectDashboardActiveTab = (state) => state[NAMESPACE].activeTab;
export const selectNewTaskDialogOpen = (state) => state[NAMESPACE].newTaskDialogOpen;
export const selectEditTaskDialogId = (state) => state[NAMESPACE].editTaskDialogId;
export const selectHighlightedTaskId = (state) => state[NAMESPACE].highlightedTaskId;

// Actions

export const setAccountMenuOpen = (accountMenuOpen) => ({
  type: SET_ACCOUNT_MENU_OPEN,
  payload: accountMenuOpen,
});

export const setSnackbarData = (snackbarData) => ({
  type: SET_SNACKBAR_DATA,
  payload: snackbarData,
});

export const setDashboardActiveTab = (tab) => ({
  type: SET_ACTIVE_TAB,
  payload: tab,
});

export const setNewTaskDialogOpen = (open) => ({
  type: SET_NEW_TASK_DIALOG_OPEN,
  payload: open,
});

export const setEditTaskDialogId = (id) => ({
  type: SET_EDIT_TASK_DIALOG_ID,
  payload: id,
});

const setStatus = (status) => ({
  type: SET_STATUS,
  payload: status,
});

export const loadDashboardTasks = () => (dispatch) => {
  dispatch(setStatus(LOADING));

  dispatch(loadTasks())
    .then(() => {
      return dispatch(loadRecurringConfigs());
    })
    .then(() => {
      dispatch(setStatus(LOADED));
    })
    .catch((error) => {
      console.error(error); // eslint-disable-line no-console
      dispatch(setStatus(ERROR));
    });
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

  return apiClient.fetchCreateTask(task).then(({ id }) => {
    dispatch(addTask(id, task));

    mixpanel.track(TASK_CREATED, {
      hasBlockers: blockedBy.length > 0,
      hasScheduledStart: !!scheduledStart,
      hasDueDate: !!due,
    });

    const updatedState = getState();
    const tab = selectTaskDashboardTab(updatedState, id);
    if (tab) {
      dispatch(setDashboardActiveTab(tab));
      dispatch(setHighlighedTask(id));
    }

    return id;
  });
};
