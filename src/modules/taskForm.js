import get from 'lodash/get';
import pick from 'lodash/pick';
import flow from 'lodash/flow';
import isEqual from 'lodash/isEqual';
import fpSet from 'lodash/fp/set';
import { createSlice, createSelector, nanoid } from '@reduxjs/toolkit';

import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import format from 'date-fns/format';

import {
  selectTask,
  selectTaskDashboardTab,
  selectTaskDescription,
  selectSubtasks,
  selectTaskDue,
  selectTaskEffort,
  selectTaskImpact,
  selectTaskScheduledStart,
  selectTaskTitle,
  updateTask,
} from './tasks';
import {
  createRecurringConfigWithId,
  deleteRecurringConfig,
  selectRecurringConfig,
  selectRecurringConfigIdByMostRecentTaskId,
  selectRecurringConfigTaskDescription,
  selectRecurringConfigTaskSubtasks,
  selectRecurringConfigTaskDueOffsetDays,
  selectRecurringConfigTaskDueTime,
  selectRecurringConfigTaskEffort,
  selectRecurringConfigTaskImpact,
  selectRecurringConfigTaskTitle,
  updateRecurringConfig,
  selectRecurringConfigUnit,
  selectRecurringConfigAmount,
  selectRecurringConfigActiveWeekdays,
} from './recurringConfigs';
import { makeNewRecurringConfigId } from '../utils/apiClient';
import * as blockerTypes from '../constants/blockerTypes';
import { selectCalendarProviderCalendarId } from './calendars';
import { createTask, selectDashboardActiveTab } from './dashboard';
import debugConsole from '../utils/debugConsole';

const name = 'taskForm';

export const FIELD_TITLE = 'title';
export const FIELD_DESCRIPTION = 'description';
export const FIELD_SUBTASKS = 'subtasks';
export const FIELD_IMPACT = 'impact';
export const FIELD_EFFORT = 'effort';
export const FIELD_DUE = 'due';
export const FIELD_SCHEDULED_START = 'scheduledStart';
export const FIELD_RECURRENCE = 'recurrence';

// Selectors

export const selectFormTaskId = (state) => state[name].taskId;
export const selectFormTitle = (state) => state[name].task.title;
export const selectFormDescription = (state) => state[name].task.description;
export const selectFormSubtasks = (state) => state[name].task.subtasks;
export const selectFormHasSubtasks = (state) => state[name].task.subtasks.length > 0;
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

const selectTaskChangesApplicableToRecurringConfig = (state) => {
  const taskId = selectFormTaskId(state);

  // If it's new or was recurring, never has changes
  if (!taskId) {
    return [];
  }

  const formTitle = selectFormTitle(state);
  const formDescription = selectFormDescription(state);
  const formSubtasks = selectFormSubtasks(state);
  const formEffort = selectFormEffort(state);
  const formImpact = selectFormImpact(state);
  const formScheduledStart = selectFormScheduledStart(state);
  const formDue = selectFormDue(state);

  const rcId = selectFormRecurringConfigId(state);
  const formRcUnit = selectFormRecurringConfigUnit(state);
  const formRcAmount = selectFormRecurringConfigAmount(state);
  const formRcActiveWeekdays = selectFormRecurringConfigActiveWeekdays(state);

  const taskTitle = selectTaskTitle(state, taskId);
  const taskDescription = selectTaskDescription(state, taskId);
  const subtasks = selectSubtasks(state, taskId);
  const taskEffort = selectTaskEffort(state, taskId);
  const taskImpact = selectTaskImpact(state, taskId);
  const taskDue = selectTaskDue(state, taskId);
  const taskScheduledStart = selectTaskScheduledStart(state, taskId);

  const rcSavedTitle = selectRecurringConfigTaskTitle(state, rcId);
  const rcSavedDescription = selectRecurringConfigTaskDescription(state, rcId);
  const rcSavedSubtasks = selectRecurringConfigTaskSubtasks(state, rcId);
  const rcSavedEffort = selectRecurringConfigTaskEffort(state, rcId);
  const rcSavedImpact = selectRecurringConfigTaskImpact(state, rcId);
  const rcSavedDueOffsetDays = selectRecurringConfigTaskDueOffsetDays(state, rcId);
  const rcSavedDueTime = selectRecurringConfigTaskDueTime(state, rcId);

  const rcSavedUnit = selectRecurringConfigUnit(state, rcId);
  const rcSavedAmount = selectRecurringConfigAmount(state, rcId);
  const rcSavedActiveWeekdays = selectRecurringConfigActiveWeekdays(state, rcId);

  const recurrenceSame =
    rcId &&
    formRcUnit === rcSavedUnit &&
    formRcAmount === rcSavedAmount &&
    isEqual(formRcActiveWeekdays, rcSavedActiveWeekdays);

  const dueSame =
    formDue === taskDue ||
    (!formDue && !rcSavedDueOffsetDays) ||
    (formDue &&
      rcSavedDueOffsetDays &&
      differenceInCalendarDays(formDue, formScheduledStart) === rcSavedDueOffsetDays &&
      format(formDue, 'HH:mm') === rcSavedDueTime);

  const scheduledStartChanged =
    taskScheduledStart !== formScheduledStart && formScheduledStart !== taskScheduledStart;

  const changes = [
    taskTitle !== formTitle && formTitle !== rcSavedTitle ? FIELD_TITLE : null,
    taskDescription !== formDescription && formDescription !== rcSavedDescription
      ? FIELD_DESCRIPTION
      : null,
    subtasks !== formSubtasks && formSubtasks !== rcSavedSubtasks ? FIELD_SUBTASKS : null,
    taskImpact !== formImpact && formImpact !== rcSavedImpact ? FIELD_IMPACT : null,
    taskEffort !== formEffort && formEffort !== rcSavedEffort ? FIELD_EFFORT : null,
    !dueSame ? FIELD_DUE : null,
    scheduledStartChanged ? FIELD_SCHEDULED_START : null,
    !recurrenceSame ? FIELD_RECURRENCE : null,
  ].filter(Boolean);

  return changes;
};

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
    subtasks: [],
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
    setFormNewSubtask: (state, { payload: index }) => {
      const newSubtask = { subtaskId: nanoid(), title: '', completed: false };
      if (index) {
        state.task.subtasks.splice(index, 0, newSubtask);
      } else {
        state.task.subtasks.push(newSubtask);
      }
    },
    setFormSubtaskText: (state, { payload: { subtaskId, title } }) => {
      state.task.subtasks = state.task.subtasks.map((subtask) =>
        subtask.subtaskId === subtaskId ? { ...subtask, title } : subtask,
      );
    },
    setFormSubtaskStatus: (state, { payload: { subtaskId, completed } }) => {
      const index = state.task.subtasks.findIndex((subtask) => subtask.subtaskId === subtaskId);
      state.task.subtasks[index].completed = completed;
    },
    deleteFormSubtask: (state, { payload: subtaskId }) => {
      state.task.subtasks = state.task.subtasks.filter(
        (subtask) => subtask.subtaskId !== subtaskId,
      );
    },
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
  setFormNewSubtask,
  setFormSubtaskText,
  setFormSubtaskStatus,
  deleteFormSubtask,
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

export const saveForm =
  ({ recurringConfigTaskDetailsChanged }) =>
  (dispatch, getState) => {
    const state = getState();
    const editingTaskId = selectFormTaskId(state);
    const editingRecurringConfigId = selectFormRecurringConfigId(state);

    const savedRecurringConfig = selectRecurringConfig(state, editingRecurringConfigId);

    const title = (selectFormTitle(state) || '').trim();
    const impact = selectFormImpact(state);
    const effort = selectFormEffort(state);
    const description = (selectFormDescription(state) || '').trim();
    // Get subtasks and filter empty ones
    const subtasks = selectFormSubtasks(state).filter((subtask) => subtask.title);
    const due = selectFormDue(state);
    const scheduledStart = selectFormScheduledStart(state);
    const snoozedUntil = selectFormSnoozedUntil(state);
    const blockedBy = selectFormBlockedBy(state);
    const calendarBlockStart = selectFormCalendarBlockStart(state);
    const calendarBlockEnd = selectFormCalendarBlockEnd(state);
    const calendarBlockCalendarId = selectFormCalendarBlockCalendarId(state);
    const formHasRecurringConfig = selectFormHasRecurringConfig(state);

    const recurringConfigUnit = selectFormRecurringConfigUnit(state);
    const recurringConfigAmount = selectFormRecurringConfigAmount(state);
    const recurringConfigActiveWeekdays = selectFormRecurringConfigActiveWeekdays(state);

    const calendarBlockProviderCalendarId = calendarBlockCalendarId
      ? selectCalendarProviderCalendarId(state, calendarBlockCalendarId)
      : undefined;
    const hasCalendarBlock = Boolean(calendarBlockStart && calendarBlockEnd);

    const needToCreateRecurringConfig = Boolean(
      formHasRecurringConfig && !editingRecurringConfigId,
    );
    const needToUpdateRecurringConfig = Boolean(
      formHasRecurringConfig &&
        editingRecurringConfigId &&
        recurringConfigTaskDetailsChanged.length > 0 &&
        savedRecurringConfig,
    );
    const needToDeleteRecurringConfig = Boolean(
      !formHasRecurringConfig && editingRecurringConfigId,
    );

    const newRecurringConfigId = needToCreateRecurringConfig ? makeNewRecurringConfigId() : null;

    const taskPromise = editingTaskId
      ? // updating a task isn't async, so let's fake it 😇
        Promise.resolve().then(() => {
          dispatch(
            updateTask(editingTaskId, {
              title,
              impact,
              effort,
              description,
              subtasks,
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
              recurringConfigId: formHasRecurringConfig
                ? // Set the ID of new recurring config to avoid needing to do an update right away
                  newRecurringConfigId || editingRecurringConfigId || null
                : // Make sure to clear recurringConfigId if we don't have any repeat info set
                  null,
            }),
          );
          return { taskId: editingTaskId, taskCreated: false };
        })
      : dispatch(
          createTask(title, impact, effort, {
            description,
            subtasks,
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
            recurringConfigId: formHasRecurringConfig
              ? // Set the ID of new recurring config to avoid needing to do an update right away
                newRecurringConfigId || editingRecurringConfigId || null
              : // Make sure to clear recurringConfigId if we don't have any repeat info set
                null,
          }),
        ).then((taskId) => ({ taskId, taskCreated: true }));

    return (
      taskPromise
        // Recurring config handling
        .then(async ({ taskId, ...info }) => {
          if (needToCreateRecurringConfig) {
            const payload = {
              unit: recurringConfigUnit,
              amount: recurringConfigAmount,
              activeWeekdays: recurringConfigActiveWeekdays || null,
              mostRecentTaskId: taskId,
              referenceDate: scheduledStart,
              taskDetails: {
                title,
                scheduledTime: format(scheduledStart, 'HH:mm'),
                description,
                subtasks,
                effort,
                impact,
                dueOffsetDays: due ? differenceInCalendarDays(due, scheduledStart) : null,
                dueTime: due ? format(due, 'HH:mm') : null,
              },
            };
            await dispatch(createRecurringConfigWithId(payload, newRecurringConfigId));
          } else if (needToUpdateRecurringConfig) {
            // We mutate taskDetails because we can't merge changes to a sub-object in Firestore
            const addDetailFunction = {
              [FIELD_TITLE]: (payload) => fpSet(`taskDetails.title`, title, payload),
              [FIELD_DESCRIPTION]: (payload) =>
                fpSet(`taskDetails.description`, description, payload),
              [FIELD_SUBTASKS]: (payload) => fpSet(`taskDetails.subtasks`, subtasks, payload),
              [FIELD_EFFORT]: (payload) => fpSet(`taskDetails.effort`, effort, payload),
              [FIELD_IMPACT]: (payload) => fpSet(`taskDetails.impact`, impact, payload),
              [FIELD_DUE]: (payload) =>
                flow(
                  fpSet(
                    `taskDetails.dueOffsetDays`,
                    due ? differenceInCalendarDays(due, scheduledStart) : null,
                  ),
                  fpSet(`taskDetails.dueTime`, due ? format(due, 'HH:mm') : null),
                )(payload),
              [FIELD_SCHEDULED_START]: (payload) =>
                flow(
                  fpSet(`referenceDate`, scheduledStart),
                  fpSet(`taskDetails.scheduledTime`, format(scheduledStart, 'HH:mm')),
                )(payload),
              [FIELD_RECURRENCE]: (payload) =>
                flow(
                  fpSet(`unit`, recurringConfigUnit),
                  fpSet(`amount`, recurringConfigAmount),
                  fpSet(`activeWeekdays`, recurringConfigActiveWeekdays || null),
                )(payload),
            };
            let updates = {
              ...(savedRecurringConfig.taskDetails
                ? { taskDetails: { ...savedRecurringConfig.taskDetails } }
                : {}),
              mostRecentTaskId: taskId,
            };
            recurringConfigTaskDetailsChanged.forEach((field) => {
              if (addDetailFunction[field]) {
                updates = addDetailFunction[field](updates);
              }
            });
            dispatch(updateRecurringConfig(editingRecurringConfigId, updates));
          } else if (needToDeleteRecurringConfig) {
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

/**
 * Returns if the changes in the form differ from what's saved in the recurring config
 *
 * This breaks Redux flow a bit, but having this selector in a thunk allows React to run it
 * on the submit callback, as opposed to on every render
 *
 * @returns {bool}
 */
export const selectThunkTaskChangesApplicableToRecurringConfig = () => (_, getState) => {
  const state = getState();
  const changes = selectTaskChangesApplicableToRecurringConfig(state);

  debugConsole.log('REDUX', 'selectThunkTaskChangesApplicableToRecurringConfig', changes);

  return changes;
};
