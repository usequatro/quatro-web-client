import get from 'lodash/get';
import pick from 'lodash/pick';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { selectTask } from './tasks';
import {
  selectRecurringConfig,
  selectRecurringConfigIdByMostRecentTaskId,
} from './recurringConfigs';
import * as blockerTypes from '../constants/blockerTypes';

const name = 'taskForm';

// Selectors

export const selectFormTaskId = (state) => state[name].taskId;
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

export const selectFormHasRecurringConfig = (state) => Boolean(state[name].hasRecurringConfig);
export const selectFormRecurringConfigId = (state) => state[name].recurringConfigId;
export const selectFormRecurringConfig = (state) => state[name].recurringConfig;
export const selectFormRecurringConfigUnit = (state) => state[name].recurringConfig.unit;
export const selectFormRecurringConfigAmount = (state) => state[name].recurringConfig.amount;
export const selectFormRecurringConfigActiveWeekdays = (state) =>
  state[name].recurringConfig.activeWeekdays;

// Slice

const initialState = {
  taskId: null,
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
  hasRecurringConfig: false,
  recurringConfigId: null,
  recurringConfig: {
    unit: null,
    amount: null,
    activeWeekdays: null,
  },
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
      state.task.blockedBy = (state.task.blockedBy || []).filter((_, index) => index !== payload);
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
    setAllTaskFormFields: (state, { payload: { taskId, task } }) => {
      state.taskId = taskId;
      state.task = pick(task, Object.keys(initialState.task));
    },
    setFormRecurringConfigToPreset: (state, { payload }) => {
      state.hasRecurringConfig = true;
      state.recurringConfig = payload;
    },
    clearFormRecurringConfig: (state) => {
      state.hasRecurringConfig = false;
      state.recurringConfig = initialState.recurringConfig;
    },
    setFormRecurringConfigUnit: (state, { payload }) => {
      state.recurringConfig.unit = payload;
    },
    setFormRecurringConfigAmount: (state, { payload }) => {
      state.recurringConfig.amount = payload;
    },
    setFormRecurringConfigActiveWeekdays: (state, { payload }) => {
      state.recurringConfig.activeWeekdays = payload;
    },
    setAllRecurringConfigFormFields: (
      state,
      { payload: { recurringConfigId, recurringConfig } },
    ) => {
      state.hasRecurringConfig = true;
      state.recurringConfigId = recurringConfigId;
      state.recurringConfig = pick(recurringConfig, Object.keys(initialState.recurringConfig));
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
  setFormCalendarBlockCalendarId,
  setFormCalendarBlockStart,
  setFormCalendarBlockEnd,
  setFormNewTaskInitialState,
  setFormRecurringConfigToPreset,
  clearFormRecurringConfig,
  setFormRecurringConfigUnit,
  setFormRecurringConfigAmount,
  setFormRecurringConfigActiveWeekdays,
} = slice.actions;

// Thunks

export const setTaskInForm = (taskId) => (dispatch, getState) => {
  const state = getState();
  const task = selectTask(state, taskId);

  // Early return to inform the dispatcher that the task doesn't exist
  if (!task) {
    return false;
  }

  dispatch(slice.actions.setAllTaskFormFields({ taskId, task }));

  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, taskId) || null;
  const recurringConfig = selectRecurringConfig(state, recurringConfigId) || null;
  if (recurringConfigId && recurringConfig) {
    dispatch(slice.actions.setAllRecurringConfigFormFields({ recurringConfigId, recurringConfig }));
  } else {
    dispatch(slice.actions.clearFormRecurringConfig());
  }

  return true;
};
