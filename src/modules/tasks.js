/**
 * Namespace to keep information of the current session, like user details.
 */

import sortBy from 'lodash/sortBy';
import cond from 'lodash/cond';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';
import { createSelector } from 'reselect';

import calculateTaskScore from '../utils/calculateTaskScore';
import createReducer from '../utils/createReducer';
import { RESET } from './reset';
import { selectUserId } from './session';
import { fetchListTasks } from '../utils/apiClient';
import NOW_TASKS_LIMIT from '../constants/nowTasksLimit';
import * as dashboardTabs from '../constants/dashboardTabs';
import * as blockerTypes from '../constants/blockerTypes';
import {
  selectRecurringConfigIdByMostRecentTaskId,
  deleteRecurringConfig,
} from './recurringConfigs';
import {
  TASK_DELETED,
  TASK_COMPLETED,
  TASK_UNDO_COMPLETE,
  TASK_MANUALLY_ARRANGED,
} from '../constants/mixpanelEvents';

export const NAMESPACE = 'tasks';

// Action types

const ADD = `${NAMESPACE}/ADD`;
const SET_MULTIPLE = `${NAMESPACE}/SET_MULTIPLE`;
export const UPDATE = `${NAMESPACE}/UPDATE`;
export const DELETE = `${NAMESPACE}/DELETE`;
const REMOVE_FROM_LIST = `${NAMESPACE}/REMOVE_FROM_LIST`;

// Reducers

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [ADD]: (state, { payload: { id, task } }) => ({
    ...state,
    allIds: [...state.allIds, id],
    byId: { ...state.byId, [id]: task },
  }),
  [SET_MULTIPLE]: (state, { payload }) => ({
    ...state,
    allIds: payload.map(([id]) => id),
    byId: payload.reduce(
      (memo, [id, task]) => ({
        ...memo,
        [id]: task,
      }),
      {},
    ),
  }),
  [UPDATE]: (state, { payload: { id, updates } }) => ({
    ...state,
    byId: { ...state.byId, [id]: { ...state.byId[id], ...updates } },
  }),
  [DELETE]: (state, { payload: { id } }) => ({
    ...state,
    allIds: state.allIds.filter((tid) => tid !== id),
    byId: { ...state.byId, [id]: null },
  }),
  [REMOVE_FROM_LIST]: (state, { payload: { id } }) => ({
    ...state,
    allIds: state.allIds.filter((tid) => tid !== id),
    byId: { ...state.byId, [id]: null },
  }),
});

// Selectors

export const namespace = 'tasks';
export const selectTask = (state, id) => state[namespace].byId[id];
export const selectTaskTitle = (state, id) => get(selectTask(state, id), 'title');
export const selectTaskDescription = (state, id) => get(selectTask(state, id), 'description');
export const selectTaskScore = (state, id) => get(selectTask(state, id), 'score');
export const selectTaskCompleted = (state, id) => get(selectTask(state, id), 'completed');
export const selectTaskScheduledStart = (state, id) => get(selectTask(state, id), 'scheduledStart');
export const selectTaskDue = (state, id) => get(selectTask(state, id), 'due');
export const selectTaskBlockedBy = (state, id) => get(selectTask(state, id), 'blockedBy');
export const selectTaskPrioritizedAheadOf = (state, id) =>
  get(selectTask(state, id), 'prioritizedAheadOf');

export const selectAllTasks = (state) =>
  state[namespace].allIds.map((id) => [id, state[namespace].byId[id]]);

const selectAllUpcomingTasks = createSelector(selectAllTasks, (allTasks) => {
  const now = Date.now();
  const upcomingTasks = allTasks.filter(
    ([, task]) => task.scheduledStart == null || task.scheduledStart <= now,
  );
  return upcomingTasks;
});

export const selectAllTasksOrderedAlphabetically = createSelector(selectAllTasks, (allTasks) => {
  return sortBy(allTasks, ([, task]) => `${task.title}`.toLowerCase());
});

/**
 * @param {[string, Object]} tasks
 * @return {[string, Object]}
 */
const sortByCustomPrioritization = (tasks) => {
  const taskBaseToAheadOf = tasks.reduce((memo, [id, task]) => {
    if (task.prioritizedAheadOf) {
      return {
        ...memo,
        [task.prioritizedAheadOf]: [...(memo[task.prioritizedAheadOf] || []), id],
      };
    }
    return memo;
  }, {});

  const topTaskIds = tasks.filter(([, task]) => !task.prioritizedAheadOf).map(([id]) => id);

  let updatedTasksIds = topTaskIds;
  const maxIterations = 10;
  let iterations = 0;

  do {
    updatedTasksIds = updatedTasksIds.reduce((memo, id) => {
      if (taskBaseToAheadOf[id]) {
        const tasksAhead = taskBaseToAheadOf[id];
        delete taskBaseToAheadOf[id];
        return [...memo, ...tasksAhead, id];
      }
      return [...memo, id];
    }, []);
    iterations += 1;
  } while (updatedTasksIds.length < tasks.length && iterations < maxIterations);

  if (iterations === maxIterations) {
    // eslint-disable-next-line no-console
    console.warn('Max iterations for custom prioritization reached');
  }

  const allTaskIds = tasks.map(([id]) => id);
  const taskIdsMissing = difference(allTaskIds, updatedTasksIds);

  if (taskIdsMissing.length) {
    // eslint-disable-next-line no-console
    console.warn('Failed to prioritize all tasks.', taskIdsMissing);
  }

  const prioritizedTaskIds = taskIdsMissing.length
    ? [...updatedTasksIds, ...taskIdsMissing]
    : updatedTasksIds;

  const tasksById = keyBy(tasks, '0');
  return prioritizedTaskIds.map((id) => tasksById[id]);
};

const selectUpcomingSortedTasks = createSelector(selectAllUpcomingTasks, (upcomingTasks) => {
  const tasksByScore = sortBy(upcomingTasks, '1.score').reverse();
  const tasksWithCustomPrioritization = sortByCustomPrioritization(tasksByScore);
  return tasksWithCustomPrioritization;
});

const selectAllUpcomingTaskIdsAsMap = createSelector(selectAllUpcomingTasks, (tasks) =>
  tasks.reduce(
    (memo, [id]) => ({
      ...memo,
      [id]: true,
    }),
    {},
  ),
);

const filterActiveBlockerDescriptors = (blockedBy, allTaskIdsMap) => {
  const filterFunction = cond([
    [(blockerDescriptor) => blockerDescriptor.type === blockerTypes.FREE_TEXT, () => true],
    [
      (blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK,
      (blockerDescriptor) => {
        const blockerTaskId = blockerDescriptor.config.taskId;
        return Boolean(allTaskIdsMap[blockerTaskId]);
      },
    ],
    [() => true, () => false],
  ]);
  return blockedBy.filter(filterFunction);
};

export const selectTaskActiveBlockerDescriptors = (state, id) => {
  const allTaskIdsMap = selectAllUpcomingTaskIdsAsMap(state);
  const blockedBy = selectTaskBlockedBy(state, id);
  return filterActiveBlockerDescriptors(blockedBy || [], allTaskIdsMap);
};

export const selectNowTasks = createSelector(
  [selectUpcomingSortedTasks, selectAllUpcomingTaskIdsAsMap],
  (tasks, taskIdsMap) =>
    tasks
      // exclude blocked ones
      .filter(
        ([, task]) => filterActiveBlockerDescriptors(task.blockedBy || [], taskIdsMap).length === 0,
      )
      // limit
      .slice(0, NOW_TASKS_LIMIT),
);

export const selectBacklogTasks = createSelector(
  [selectUpcomingSortedTasks, selectAllUpcomingTaskIdsAsMap],
  (tasks, taskIdsMap) =>
    tasks
      // exclude blocked ones
      .filter(
        ([, task]) => filterActiveBlockerDescriptors(task.blockedBy || [], taskIdsMap).length === 0,
      )
      // limit
      .slice(NOW_TASKS_LIMIT),
);

export const selectHasMoveToBacklog = createSelector(
  selectBacklogTasks,
  (tasks) => tasks.length > 1,
);

export const selectScheduledTasks = createSelector(selectAllTasks, (allTasks) => {
  const now = Date.now();
  const scheduledTasks = allTasks.filter(
    ([, task]) => task.scheduledStart != null && task.scheduledStart > now,
  );
  return sortBy(scheduledTasks, '1.scheduledStart');
});

export const selectBlockedTasks = createSelector(
  [selectAllUpcomingTasks, selectAllUpcomingTaskIdsAsMap],
  (tasks, taskIdsMap) => {
    const blockedTasks = tasks.filter(
      ([, task]) => filterActiveBlockerDescriptors(task.blockedBy, taskIdsMap).length > 0,
    );
    return sortBy(blockedTasks, '1.score').reverse();
  },
);

const selectTasksPrioritizedAheadOf = (state, id) =>
  selectAllTasks(state).filter((task) => task.prioritizedAheadOf === id);

export const selectTaskDashboardTab = (state, taskId) =>
  cond([
    [() => selectNowTasks(state).find(([id]) => id === taskId), () => dashboardTabs.NOW],
    [() => selectBacklogTasks(state).find(([id]) => id === taskId), () => dashboardTabs.BACKLOG],
    [
      () => selectScheduledTasks(state).find(([id]) => id === taskId),
      () => dashboardTabs.SCHEDULED,
    ],
    [() => selectBlockedTasks(state).find(([id]) => id === taskId), () => dashboardTabs.BLOCKED],
    [() => true, () => undefined],
  ])();

// Actions

export const loadTasks = () => async (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[tasks:loadTasks] No userId');
  }
  const results = await fetchListTasks(userId);
  const resultsWithScore = results.map(([id, task]) => [
    id,
    {
      ...task,
      score: calculateTaskScore(task.impact, task.effort, task.due),
    },
  ]);
  dispatch({ type: SET_MULTIPLE, payload: resultsWithScore });
  return results;
};

export const addTask = (id, task) => ({
  type: ADD,
  payload: {
    id,
    task: {
      ...task,
      score: calculateTaskScore(task.impact, task.effort, task.due),
    },
  },
});

export const updateTask = (id, updates) => ({ type: UPDATE, payload: { id, updates } });

export const setRelativePrioritization = (sourceIndex, destinationIndex) => async (
  dispatch,
  getState,
  { mixpanel },
) => {
  const state = getState();

  const allTasks = [...selectNowTasks(state), ...selectBacklogTasks(state)];
  const sourceTaskId = get(allTasks, [sourceIndex, '0']);
  if (!sourceTaskId) {
    throw new Error(`No source task found with index ${sourceIndex}`);
  }

  if (destinationIndex >= allTasks.length || !allTasks[destinationIndex]) {
    throw new Error(`Movement not supported with destination index ${destinationIndex}`);
  }

  const targetTaskId = get(allTasks, [destinationIndex, '0']);
  if (!targetTaskId) {
    throw new Error(`No target task found for destination index ${destinationIndex}`);
  }

  if (targetTaskId === sourceTaskId) {
    // eslint-disable-next-line no-console
    console.log('Nothing to do, target and source are the same');
    return; // nothing to do on this case, the task is already where it needs to be.
  }

  const sourceTask = get(allTasks, [sourceIndex, '1']);
  if (sourceTask.prioritizedAheadOf === targetTaskId) {
    // eslint-disable-next-line no-console
    console.log('Nothing to do, task is already prioritized ahead of that one');
    return;
  }

  // If there are other tasks depending on the one that is going to be moved,
  // we're going to associate them to the next one, so that they stay on the same spot.
  const tasksPrioritizedBefore = selectTasksPrioritizedAheadOf(state, sourceTaskId);
  const taskAfter = allTasks[sourceIndex + 1];

  dispatch(updateTask(sourceTaskId, { prioritizedAheadOf: targetTaskId }));
  tasksPrioritizedBefore.forEach((task) => {
    dispatch(updateTask(task.id, { prioritizedAheadOf: taskAfter.id }));
  });

  mixpanel.track(TASK_MANUALLY_ARRANGED);
};

export const clearRelativePrioritization = (id) => updateTask(id, { prioritizedAheadOf: null });

export const completeTask = (id) => (dispatch, _, { mixpanel }) => {
  dispatch(updateTask(id, { completed: Date.now() }));

  const timeout = setTimeout(() => {
    dispatch({ type: REMOVE_FROM_LIST, payload: { id } });
    mixpanel.track(TASK_COMPLETED);
  }, 1000);

  // Return function to cancel the completion
  return () => {
    clearTimeout(timeout);
    dispatch(updateTask(id, { completed: null }));
  };
};

export const undoCompleteTask = (id, task) => (dispatch, _, { mixpanel }) => {
  dispatch(addTask(id, task));
  dispatch(updateTask(id, { completed: null }));

  mixpanel.track(TASK_UNDO_COMPLETE);
};

export const deleteTask = (id) => (dispatch, getState, { mixpanel }) => {
  dispatch({ type: DELETE, payload: { id } });

  // If there's a recurring config associated, we clear it too so it stops repeating
  const state = getState();
  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, id);
  if (recurringConfigId) {
    dispatch(deleteRecurringConfig(recurringConfigId));
  }

  mixpanel.track(TASK_DELETED);
};
