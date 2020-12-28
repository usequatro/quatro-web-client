import get from 'lodash/get';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { selectTask } from './tasks';
import { selectRecurringConfigByMostRecentTaskId } from './recurringConfigs';
import * as blockerTypes from '../constants/blockerTypes';

const name = 'taskForm';

// Selectors

export const selectTitle = (state) => state[name].title;
export const selectDescription = (state) => state[name].description;
export const selectImpact = (state) => state[name].impact;
export const selectEffort = (state) => state[name].effort;
export const selectScheduledStart = (state) => state[name].scheduledStart;
export const selectDue = (state) => state[name].due;
export const selectBlockedBy = (state) => state[name].blockedBy;
export const selectRecurringConfig = (state) => state[name].recurringConfig;

export const selectBlockedByTaskIds = createSelector(selectBlockedBy, (blockedBy) =>
  (blockedBy || [])
    .filter((blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK)
    .map((blockerDescriptor) => get(blockerDescriptor, 'config.taskId'))
    .filter(Boolean),
);

// Slice

const initialState = {
  title: '',
  description: '',
  impact: 4,
  effort: 0,
  scheduledStart: null,
  due: null,
  blockedBy: [],
  recurringConfig: null,
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    setTitle: (state, { payload }) => {
      state.title = payload;
    },
    setDescription: (state, { payload }) => {
      state.description = payload;
    },
    setImpact: (state, { payload }) => {
      state.impact = payload;
    },
    setEffort: (state, { payload }) => {
      state.effort = payload;
    },
    setScheduledStart: (state, { payload }) => {
      state.scheduledStart = payload;
    },
    setDue: (state, { payload }) => {
      state.due = payload;
    },
    addTaskBlocker: (state, { payload }) => {
      state.blockedBy.push({
        type: blockerTypes.TASK,
        config: { taskId: payload },
      });
    },
    addFreeTextBlocker: (state, { payload }) => {
      state.blockedBy.push({
        type: blockerTypes.FREE_TEXT,
        config: { value: payload },
      });
    },
    removeBlockerByIndex: (state, { payload }) => {
      state.blockedBy = (state.blockedBy || []).filter((_, index) => index !== payload);
    },
    setRecurringConfig: (state, { payload }) => {
      state.recurringConfig = payload;
    },
    setNewTaskInitialState: () => initialState,
    setAll: (state, { payload }) => ({ ...state, ...payload }),
  },
});
/* eslint-enable no-param-reassign */

export default slice;

export const {
  setTitle,
  setDescription,
  setImpact,
  setEffort,
  setScheduledStart,
  setDue,
  addTaskBlocker,
  addFreeTextBlocker,
  removeBlockerByIndex,
  setRecurringConfig,
  setNewTaskInitialState,
} = slice.actions;

// Thunks

export const setTaskInForm = (taskId) => (dispatch, getState) => {
  const state = getState();
  const task = selectTask(state, taskId);

  // Early return to inform the dispatcher that the task doesn't exist
  if (!task) {
    return false;
  }

  dispatch(slice.actions.setAll(task));

  const recurringConfig = selectRecurringConfigByMostRecentTaskId(state, taskId) || null;
  dispatch(setRecurringConfig(recurringConfig));

  return true;
};
