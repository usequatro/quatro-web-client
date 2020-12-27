/**
 * Namespace to keep information of the current session, like user details.
 */
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import cond from 'lodash/cond';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';
import { createSelector } from 'reselect';

import calculateTaskScore from '../utils/calculateTaskScore';
import debugConsole from '../utils/debugConsole';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import createReducer from '../utils/createReducer';
import { LOG_OUT } from './reset';
import { listenListTasks, fetchDeleteTask, fetchUpdateTask } from '../utils/apiClient';
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

const ADD_CHANGES_TO_LOCAL_STATE = `${NAMESPACE}/ADD_CHANGES_TO_LOCAL_STATE`;
const RESET_LOCAL_STATE = `${NAMESPACE}/RESET_LOCAL_STATE`;

// Reducers

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

const applyScores = (state) => ({
  ...state,
  byId: Object.keys(state.byId).reduce(
    (memo, id) => ({
      ...memo,
      [id]: {
        ...state.byId[id],
        score: calculateTaskScore(state.byId[id].impact, state.byId[id].effort, state.byId[id].due),
      },
    }),
    {},
  ),
});
export const reducer = createReducer(INITIAL_STATE, {
  [LOG_OUT]: () => ({ ...INITIAL_STATE }),
  [RESET_LOCAL_STATE]: () => ({ ...INITIAL_STATE }),
  [ADD_CHANGES_TO_LOCAL_STATE]: (state, { payload: { added, modified, removed } }) => {
    const newState = applyGroupedEntityChanges(state, { added, modified, removed });
    const newStateWithScores = applyScores(newState);
    return newStateWithScores;
  },
});

// Selectors

export const namespace = 'tasks';
export const selectTask = (state, id) => state[namespace].byId[id];
export const selectTaskExists = (state, id) => Boolean(state[namespace].byId[id]);
export const selectTaskTitle = (state, id) => get(selectTask(state, id), 'title');
export const selectTaskDescription = (state, id) => get(selectTask(state, id), 'description');
export const selectTaskImpact = (state, id) => get(selectTask(state, id), 'impact');
export const selectTaskEffort = (state, id) => get(selectTask(state, id), 'effort');
export const selectTaskScore = (state, id) => get(selectTask(state, id), 'score');
export const selectTaskCompleted = (state, id) => get(selectTask(state, id), 'completed');
export const selectTaskScheduledStart = (state, id) => get(selectTask(state, id), 'scheduledStart');
export const selectTaskDue = (state, id) => get(selectTask(state, id), 'due');
export const selectTaskBlockedBy = (state, id) => get(selectTask(state, id), 'blockedBy');
export const selectTaskPrioritizedAheadOf = (state, id) =>
  get(selectTask(state, id), 'prioritizedAheadOf');

const selectAllTaskIds = (state) => state[namespace].allIds;
const selectAllTaskIdsAsMap = createSelector(selectAllTaskIds, (ids) =>
  ids.reduce((memo, id) => ({ ...memo, [id]: true }), {}),
);

const selectAllTasks = (state) =>
  selectAllTaskIds(state).map((id) => [id, state[namespace].byId[id]]);

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
  const tasksByScore = cloneDeep(upcomingTasks);
  tasksByScore.sort(([, task1], [, task2]) => {
    if (task1.score === task2.score) {
      return task2.created - task1.created;
    }
    return task2.score - task1.score;
  });

  const tasksWithCustomPrioritization = sortByCustomPrioritization(tasksByScore);
  return tasksWithCustomPrioritization;
});

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
  const allTaskIdsMap = selectAllTaskIdsAsMap(state);
  const blockedBy = selectTaskBlockedBy(state, id);
  return filterActiveBlockerDescriptors(blockedBy || [], allTaskIdsMap);
};

export const selectNowTasks = createSelector(
  [selectUpcomingSortedTasks, selectAllTaskIdsAsMap],
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
  [selectUpcomingSortedTasks, selectAllTaskIdsAsMap],
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
  [selectAllUpcomingTasks, selectAllTaskIdsAsMap],
  (tasks, taskIdsMap) => {
    const blockedTasks = tasks.filter(
      ([, task]) => filterActiveBlockerDescriptors(task.blockedBy, taskIdsMap).length > 0,
    );
    return sortBy(blockedTasks, '1.score').reverse();
  },
);

const selectTasksPrioritizedAheadOfGivenTask = (state, id) =>
  selectAllTasks(state).filter(([, task]) => task.prioritizedAheadOf === id);

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

export const getTabProperties = (tab) => {
  const tabProperties = {
    [dashboardTabs.NOW]: {
      text: dashboardTabs.NOW,
      link: dashboardTabs.NOW,
    },
    [dashboardTabs.BACKLOG]: {
      text: dashboardTabs.BACKLOG,
      link: dashboardTabs.BACKLOG,
    },
    [dashboardTabs.SCHEDULED]: {
      text: dashboardTabs.SCHEDULED,
      link: dashboardTabs.SCHEDULED,
    },
    [dashboardTabs.BLOCKED]: { text: dashboardTabs.BLOCKED, link: dashboardTabs.BLOCKED },
  };

  return tabProperties[tab] || tabProperties[dashboardTabs.NOW];
};

// Actions

export const listenToTaskList = (userId, nextCallback, errorCallback) => (dispatch) => {
  const onNext = ({ groupedChangedEntities, hasEntityChanges, hasLocalUnsavedChanges }) => {
    debugConsole.log('Firestore', 'listenToTaskList', {
      groupedChangedEntities,
      hasEntityChanges,
      hasLocalUnsavedChanges,
    });
    if (hasEntityChanges) {
      dispatch({ type: ADD_CHANGES_TO_LOCAL_STATE, payload: groupedChangedEntities });
    }
    nextCallback(hasLocalUnsavedChanges);
  };
  const onError = (error) => {
    errorCallback(error);
  };

  dispatch({ type: RESET_LOCAL_STATE });
  const unsubscribe = listenListTasks(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToTaskList', 'unsubscribe');
    unsubscribe();
  };
};

export const updateTask = (id, updates) => () => {
  fetchUpdateTask(id, updates);
};

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
  const tasksPrioritizedBefore = selectTasksPrioritizedAheadOfGivenTask(state, sourceTaskId);
  const taskAfter = allTasks[sourceIndex + 1];

  fetchUpdateTask(sourceTaskId, { prioritizedAheadOf: targetTaskId });
  tasksPrioritizedBefore.forEach((task) => {
    fetchUpdateTask(task.id, { prioritizedAheadOf: taskAfter.id });
  });

  mixpanel.track(TASK_MANUALLY_ARRANGED);
};

export const clearRelativePrioritization = (id) => () =>
  fetchUpdateTask(id, { prioritizedAheadOf: null });

export const completeTask = (id) => (dispatch, getState, { mixpanel }) => {
  const timeout = setTimeout(() => {
    const state = getState();

    // Clear relative prioritization depending on this task
    const tasksPrioritizedAheadOfCompletedTask = selectTasksPrioritizedAheadOfGivenTask(state, id);
    tasksPrioritizedAheadOfCompletedTask.forEach(([relatedTaskId]) => {
      fetchUpdateTask(relatedTaskId, { prioritizedAheadOf: null });
    });

    fetchUpdateTask(id, { completed: Date.now() });
    mixpanel.track(TASK_COMPLETED);
  }, 750);

  // Return function to cancel the completion
  return () => {
    clearTimeout(timeout);
  };
};

export const undoCompleteTask = (id) => (dispatch, _, { mixpanel }) => {
  fetchUpdateTask(id, { completed: null });
  mixpanel.track(TASK_UNDO_COMPLETE);
};

export const deleteTask = (id) => (dispatch, getState, { mixpanel }) => {
  // If there's a recurring config associated, we clear it too so it stops repeating
  const state = getState();
  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, id);

  // Clear relative prioritization depending on this task
  const tasksPrioritizedAheadOfCompletedTask = selectTasksPrioritizedAheadOfGivenTask(state, id);
  tasksPrioritizedAheadOfCompletedTask.forEach(([relatedTaskId]) => {
    fetchUpdateTask(relatedTaskId, { prioritizedAheadOf: null });
  });

  fetchDeleteTask(id);
  if (recurringConfigId) {
    dispatch(deleteRecurringConfig(recurringConfigId));
  }

  mixpanel.track(TASK_DELETED);
};
