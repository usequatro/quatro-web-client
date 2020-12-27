import get from 'lodash/get';
import { createSelector } from 'reselect';

import { LOG_OUT } from './reset';
import { selectTask } from './tasks';
import { selectRecurringConfigByMostRecentTaskId } from './recurringConfigs';
import createReducer from '../utils/createReducer';
import * as blockerTypes from '../constants/blockerTypes';

export const NAMESPACE = 'taskForm';

// Action types

const SET_TITLE = `${NAMESPACE}/SET_TITLE`;
const SET_DESCRIPTION = `${NAMESPACE}/SET_DESCRIPTION`;
const SET_IMPACT = `${NAMESPACE}/SET_IMPACT`;
const SET_EFFORT = `${NAMESPACE}/SET_EFFORT`;
const SET_SCHEDULED_START = `${NAMESPACE}/SET_SCHEDULED_START`;
const SET_DUE = `${NAMESPACE}/SET_DUE`;
const ADD_TASK_BLOCKER = `${NAMESPACE}/ADD_TASK_BLOCKER`;
const ADD_FREE_TEXT_BLOCKER = `${NAMESPACE}/ADD_FREE_TEXT_BLOCKER`;
const REMOVE_BLOCKER_BY_INDEX = `${NAMESPACE}/REMOVE_BLOCKER_BY_INDEX`;
const SET_RECURRING_CONFIG = `${NAMESPACE}/SET_RECURRING_CONFIG`;

const SET_ALL = `${NAMESPACE}/SET_ALL`;

// Reducers

const INITIAL_STATE = {
  title: '',
  description: '',
  impact: 4,
  effort: 0,
  scheduledStart: null,
  due: null,
  blockedBy: [],
  recurringConfig: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [LOG_OUT]: () => ({ ...INITIAL_STATE }),
  [SET_TITLE]: (state, { payload }) => ({ ...state, title: payload }),
  [SET_DESCRIPTION]: (state, { payload }) => ({ ...state, description: payload }),
  [SET_IMPACT]: (state, { payload }) => ({ ...state, impact: payload }),
  [SET_EFFORT]: (state, { payload }) => ({ ...state, effort: payload }),
  [SET_SCHEDULED_START]: (state, { payload }) => ({ ...state, scheduledStart: payload }),
  [SET_DUE]: (state, { payload }) => ({ ...state, due: payload }),
  [ADD_TASK_BLOCKER]: (state, { payload }) => ({
    ...state,
    blockedBy: [
      ...(state.blockedBy || []),
      {
        type: blockerTypes.TASK,
        config: { taskId: payload },
      },
    ],
  }),
  [ADD_FREE_TEXT_BLOCKER]: (state, { payload }) => ({
    ...state,
    blockedBy: [
      ...(state.blockedBy || []),
      {
        type: blockerTypes.FREE_TEXT,
        config: { value: payload },
      },
    ],
  }),
  [REMOVE_BLOCKER_BY_INDEX]: (state, { payload }) => ({
    ...state,
    blockedBy: (state.blockedBy || []).filter((_, index) => index !== payload),
  }),
  [SET_RECURRING_CONFIG]: (state, { payload }) => ({
    ...state,
    recurringConfig: payload,
  }),

  [SET_ALL]: (state, { payload }) => ({
    ...state,
    ...payload,
  }),
});

// Selectors

export const selectTitle = (state) => state[NAMESPACE].title;
export const selectDescription = (state) => state[NAMESPACE].description;
export const selectImpact = (state) => state[NAMESPACE].impact;
export const selectEffort = (state) => state[NAMESPACE].effort;
export const selectScheduledStart = (state) => state[NAMESPACE].scheduledStart;
export const selectDue = (state) => state[NAMESPACE].due;
export const selectBlockedBy = (state) => state[NAMESPACE].blockedBy;
export const selectRecurringConfig = (state) => state[NAMESPACE].recurringConfig;

export const selectBlockedByTaskIds = createSelector(selectBlockedBy, (blockedBy) =>
  (blockedBy || [])
    .filter((blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK)
    .map((blockerDescriptor) => get(blockerDescriptor, 'config.taskId'))
    .filter(Boolean),
);

// Actions

export const setTitle = (payload) => ({ type: SET_TITLE, payload });
export const setDescription = (payload) => ({ type: SET_DESCRIPTION, payload });
export const setImpact = (payload) => ({ type: SET_IMPACT, payload });
export const setEffort = (payload) => ({ type: SET_EFFORT, payload });
export const setScheduledStart = (payload) => ({ type: SET_SCHEDULED_START, payload });
export const setDue = (payload) => ({ type: SET_DUE, payload });
export const addTaskBlocker = (taskId) => ({ type: ADD_TASK_BLOCKER, payload: taskId });
export const addFreeTextBlocker = (text) => ({ type: ADD_FREE_TEXT_BLOCKER, payload: text });
export const removeBlockerByIndex = (payload) => ({ type: REMOVE_BLOCKER_BY_INDEX, payload });
export const setRecurringConfig = (payload) => ({ type: SET_RECURRING_CONFIG, payload });

export const setNewTaskInitialState = () => ({ type: SET_ALL, payload: INITIAL_STATE });
export const setTaskInForm = (taskId) => (dispatch, getState) => {
  const state = getState();
  const task = selectTask(state, taskId);

  // Early return to inform the dispatcher that the task doesn't exist
  if (!task) {
    return false;
  }

  dispatch({ type: SET_ALL, payload: task });

  const recurringConfig = selectRecurringConfigByMostRecentTaskId(state, taskId) || null;
  dispatch({ type: SET_RECURRING_CONFIG, payload: recurringConfig });

  return true;
};
