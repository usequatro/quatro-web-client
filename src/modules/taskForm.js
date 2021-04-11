import get from 'lodash/get';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { selectTask } from './tasks';
import { selectRecurringConfigByMostRecentTaskId } from './recurringConfigs';
import * as blockerTypes from '../constants/blockerTypes';

const name = 'taskForm';

// Selectors

// export const selectFormTaskId = (state) => state[name].taskId;
export const selectFormTitle = (state) => state[name].task.title;
export const selectFormDescription = (state) => state[name].task.description;
export const selectFormImpact = (state) => state[name].task.impact;
export const selectFormEffort = (state) => state[name].task.effort;
export const selectFormScheduledStart = (state) => state[name].task.scheduledStart;
export const selectFormSnoozedUntil = (state) => state[name].task.snoozedUntil;
export const selectFormDue = (state) => state[name].task.due;
export const selectFormBlockedBy = (state) => state[name].task.blockedBy;
export const selectFormCalendarBlockCalendarId = (state) =>
  state[name].task.calendarBlockCalendarId;
export const selectFormCalendarBlockProviderEventId = (state) =>
  state[name].task.calendarBlockProviderEventId;
export const selectFormCalendarBlockStart = (state) => state[name].task.calendarBlockStart;
export const selectFormCalendarBlockEnd = (state) => state[name].task.calendarBlockEnd;

export const selectFormBlockedByTaskIds = createSelector(selectFormBlockedBy, (blockedBy) =>
  (blockedBy || [])
    .filter((blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK)
    .map((blockerDescriptor) => get(blockerDescriptor, 'config.taskId'))
    .filter(Boolean),
);

// export const selectFormRecurringConfigId = (state) => state[name].recurringConfigId;
export const selectFormRecurringConfig = (state) => state[name].recurringConfig;

// Slice

const initialState = {
  // taskId: null,
  task: {
    title: '',
    description: '',
    impact: 3,
    effort: 0,
    scheduledStart: null,
    snoozedUntil: null,
    due: null,
    blockedBy: [],
    recurringConfig: null,
    calendarBlockCalendarId: null,
    calendarBlockStart: null,
    calendarBlockEnd: null,
  },
  // recurringConfigId: null,
  recurringConfig: null,
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    setFormTitle: (state, { payload }) => {
      state.task.title = payload;
    },
    setFormDescription: (state, { payload }) => {
      state.task.description = payload;
    },
    setFormImpact: (state, { payload }) => {
      state.task.impact = payload;
    },
    setFormEffort: (state, { payload }) => {
      state.task.effort = payload;
    },
    setFormScheduledStart: (state, { payload }) => {
      state.task.scheduledStart = payload;
    },
    setFormSnoozedUntil: (state, { payload }) => {
      state.task.snoozedUntil = payload;
    },
    setFormDue: (state, { payload }) => {
      state.task.due = payload;
    },
    addFormTaskBlocker: (state, { payload }) => {
      state.task.blockedBy.push({
        type: blockerTypes.TASK,
        config: { taskId: payload },
      });
    },
    addFormFreeTextBlocker: (state, { payload }) => {
      state.task.blockedBy.push({
        type: blockerTypes.FREE_TEXT,
        config: { value: payload },
      });
    },
    removeFormBlockerByIndex: (state, { payload }) => {
      state.task.blockedBy = (state.blockedBy || []).filter((_, index) => index !== payload);
    },
    setFormCalendarBlockCalendarId: (state, { payload }) => {
      state.task.calendarBlockCalendarId = payload;
    },
    setFormCalendarBlockStart: (state, { payload }) => {
      state.task.calendarBlockStart = payload;
    },
    setFormCalendarBlockEnd: (state, { payload }) => {
      state.task.calendarBlockEnd = payload;
    },
    setAllTaskFormFields: (state, { payload }) => {
      state.task = payload;
    },
    setFormRecurringConfig: (state, { payload }) => {
      state.recurringConfig = payload;
    },
    setFormNewTaskInitialState: () => initialState,
  },
});
/* eslint-enable no-param-reassign */

export default slice;

export const {
  setFormTitle,
  setFormDescription,
  setFormImpact,
  setFormEffort,
  setFormScheduledStart,
  setFormSnoozedUntil,
  setFormDue,
  addFormTaskBlocker,
  addFormFreeTextBlocker,
  removeFormBlockerByIndex,
  setFormRecurringConfig,
  setFormCalendarBlockCalendarId,
  setFormCalendarBlockStart,
  setFormCalendarBlockEnd,
  setFormNewTaskInitialState,
} = slice.actions;

// Thunks

export const setTaskInForm = (taskId) => (dispatch, getState) => {
  const state = getState();
  const task = selectTask(state, taskId);

  // Early return to inform the dispatcher that the task doesn't exist
  if (!task) {
    return false;
  }

  dispatch(slice.actions.setAllTaskFormFields(task));

  const recurringConfig = selectRecurringConfigByMostRecentTaskId(state, taskId) || null;
  dispatch(setFormRecurringConfig(recurringConfig));

  return true;
};
