import get from 'lodash/get';
import pick from 'lodash/pick';
import { createSlice, createSelector } from '@reduxjs/toolkit';

import { selectTask, selectTaskDashboardTab, updateTask } from './tasks';
import {
  createRecurringConfig,
  deleteRecurringConfig,
  selectRecurringConfig,
  selectRecurringConfigIdByMostRecentTaskId,
  updateRecurringConfig,
} from './recurringConfigs';
import * as blockerTypes from '../constants/blockerTypes';
import { selectCalendarProviderCalendarId } from './calendars';
import { createTask, selectDashboardActiveTab } from './dashboard';
import { TASK_CREATED, TASK_UPDATED } from '../constants/mixpanelEvents';

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
    setFormRecurringConfig: (state, { payload }) => {
      if (payload) {
        state.hasRecurringConfig = true;
        state.recurringConfig = pick(payload, Object.keys(initialState.recurringConfig));
      } else {
        state.hasRecurringConfig = false;
        state.recurringConfig = initialState.recurringConfig;
      }
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
  setFormRecurringConfig,
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
    dispatch(slice.actions.setFormRecurringConfig(null));
  }

  return true;
};

export const saveForm = () => (dispatch, getState, { mixpanel }) => {
  const state = getState();
  const editingTaskId = selectFormTaskId(state);
  const editingRecurringConfigId = selectFormRecurringConfigId(state);

  const title = (selectFormTitle(state) || '').trim();
  const impact = selectFormImpact(state);
  const effort = selectFormEffort(state);
  const description = (selectFormDescription(state) || '').trim();
  const due = selectFormDue(state);
  const scheduledStart = selectFormScheduledStart(state);
  const snoozedUntil = selectFormSnoozedUntil(state);
  const blockedBy = selectFormBlockedBy(state);
  const calendarBlockStart = selectFormCalendarBlockStart(state);
  const calendarBlockEnd = selectFormCalendarBlockEnd(state);
  const calendarBlockCalendarId = selectFormCalendarBlockCalendarId(state);
  const recurringConfig = selectFormRecurringConfig(state);
  const formHasRecurringConfig = selectFormHasRecurringConfig(state);

  const calendarBlockProviderCalendarId = calendarBlockCalendarId
    ? selectCalendarProviderCalendarId(state, calendarBlockCalendarId)
    : undefined;
  const hasCalendarBlock = Boolean(calendarBlockStart && calendarBlockEnd);

  const taskPromise = editingTaskId
    ? // updating a task isn't async, so let's fake it 😇
      Promise.resolve().then(() => {
        dispatch(
          updateTask(editingTaskId, {
            title,
            impact,
            effort,
            description,
            due,
            scheduledStart,
            snoozedUntil,
            blockedBy,
            calendarBlockCalendarId: hasCalendarBlock ? calendarBlockCalendarId : null,
            calendarBlockProviderCalendarId: hasCalendarBlock
              ? calendarBlockProviderCalendarId
              : null,
            calendarBlockStart: hasCalendarBlock ? calendarBlockStart : null,
            calendarBlockEnd: hasCalendarBlock ? calendarBlockEnd : null,
            // Make sure to clear recurringConfigId if we don't have any repeat info set
            ...(!formHasRecurringConfig ? { recurringConfigId: null } : {}),
          }),
        ).then(() => {
          mixpanel.track(TASK_UPDATED, {
            hasBlockers: blockedBy.length > 0,
            hasScheduledStart: Boolean(scheduledStart),
            hasSnoozedUntil: Boolean(snoozedUntil),
            hasDueDate: Boolean(due),
            isRecurring: Boolean(recurringConfig),
            hasCalendarBlock,
            hasDescription: Boolean(description),
            impact,
            effort,
          });
        });
        return { taskId: editingTaskId, taskCreated: false };
      })
    : dispatch(
        createTask(title, impact, effort, {
          description,
          due,
          scheduledStart,
          snoozedUntil,
          blockedBy,
          calendarBlockCalendarId: hasCalendarBlock ? calendarBlockCalendarId : null,
          calendarBlockProviderCalendarId: hasCalendarBlock
            ? calendarBlockProviderCalendarId
            : null,
          calendarBlockStart: hasCalendarBlock ? calendarBlockStart : null,
          calendarBlockEnd: hasCalendarBlock ? calendarBlockEnd : null,
        }),
      ).then((taskId) => {
        mixpanel.track(TASK_CREATED, {
          hasBlockers: blockedBy.length > 0,
          hasScheduledStart: Boolean(scheduledStart),
          hasSnoozedUntil: Boolean(snoozedUntil),
          hasDueDate: Boolean(due),
          isRecurring: Boolean(recurringConfig),
          hasCalendarBlock,
          hasDescription: Boolean(description),
          impact,
          effort,
        });
        return { taskId, taskCreated: true };
      });

  return (
    taskPromise
      // Recurring config handling
      .then(async ({ taskId, ...info }) => {
        if (formHasRecurringConfig) {
          if (editingRecurringConfigId) {
            dispatch(
              updateRecurringConfig(editingRecurringConfigId, {
                ...recurringConfig,
                mostRecentTaskId: taskId,
              }),
            );
          } else {
            const newRcId = await dispatch(
              createRecurringConfig({ ...recurringConfig, mostRecentTaskId: taskId }),
            );
            dispatch(updateTask(taskId, { recurringConfigId: newRcId }));
          }
        } else if (editingRecurringConfigId) {
          dispatch(deleteRecurringConfig(editingRecurringConfigId));
        }
        return { taskId, ...info };
      })
      // Add extra info
      .then(({ taskId, ...info }) => {
        const postState = getState();
        const tabTask = selectTaskDashboardTab(postState, taskId);
        const dashboardActiveTab = selectDashboardActiveTab(state);
        return {
          taskId,
          tabTask,
          dashboardActiveTab,
          ...info,
        };
      })
  );
};
