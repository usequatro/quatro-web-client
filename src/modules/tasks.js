import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';
import uuid from 'uuid/v4';
import createReducer from '../util/createReducer';
import isRequired from '../util/isRequired';
import * as apiClient from './apiClient';
import NOW_TASKS_LIMIT from '../constants/nowTasksLimit';
import * as blockerTypes from '../constants/blockerTypes';
import {
  showInfoNotification,
  showErrorNotification,
  showNetworkErrorNotification,
  hideNotification,
} from './notification';

export const NAMESPACE = 'tasks';

const TASK_KEY_DEFAULTS = {
  effort: null,
  impact: null,
  description: '',
  due: null,
  scheduledStart: null,
  completed: null,
  trashed: null,
};
const TASK_KEYS_FOR_REDUX = {
  id: true,
  title: true,
  effort: true,
  impact: true,
  description: true,
  created: true,
  due: true,
  scheduledStart: true,
  completed: true,
  score: true,
  trashed: true,
  userId: true,
  prioritizedAheadOf: true,
};
const TASK_KEYS_FOR_API = {
  title: true,
  effort: true,
  impact: true,
  description: true,
  created: true,
  due: true,
  scheduledStart: true,
  completed: true,
  trashed: true,
  userId: true,
  blockedBy: true,
  prioritizedAheadOf: true,
};

// Utilities

const generateId = (prefix = '_') => `${prefix}${uuid()}`;
const isTemporaryId = id => /^_/.test(id);

const filterTaskKeys = (task, keys = isRequired()) => {
  const filteredTask = Object.entries(task).reduce((memo, [key, value]) => {
    if (!keys[key]) {
      console.warn(`[tasks] Unknown key "${key}" with value "${value}" in task ${task.id}`);
      return memo;
    }
    return { ...memo, [key]: value };
  }, {});
  return filteredTask;
};

const normalizeBase = (value, from, to) => (value * to) / from;
const convertMillisecondsToDays = time => time / (1000 * 60 * 60 * 24);
const getDaysDue = due => convertMillisecondsToDays(Math.max(due - Date.now(), 0));

const calculateScore = (impact, effort, due) => {
  if (!Number.isInteger(impact) || !Number.isInteger(effort)) {
    return 0;
  }
  const normalizedImpact = normalizeBase(impact, 7, 10);
  const normalizedEffort = normalizeBase(effort, 7, 10);

  const weightenedImpact = normalizedImpact ** 1.5;
  const weightenedEffort = normalizedEffort ** 1;

  // https://www.wolframalpha.com/input/?i=plot+2%2Fx
  const daysUntilFactor = due
    ? 1 + 2 / Math.min(getDaysDue(due), 10000)
    : 1;

  return (weightenedImpact / weightenedEffort) * daysUntilFactor;
};
const addScore = task => ({
  ...task,
  score: calculateScore(task.impact, task.effort, task.due),
});

const toInt = (value, fallback) => (!Number.isNaN(Number.parseInt(value, 10))
  ? Number.parseInt(value, 10)
  : fallback);

// Action types

const SET_TASKS = `${NAMESPACE}/SET_TASKS`;
const ADD_TASK = `${NAMESPACE}/ADD_TASK`;
const REMOVE_TASK_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_FROM_ALL_IDS`;
const UPDATE_TASK = `${NAMESPACE}/UPDATE_TASK`;
const UPDATE_TASK_BATCH = `${NAMESPACE}/UPDATE_TASK_BATCH`;
const RESET = `${NAMESPACE}/RESET`;
const UPDATE_TASK_DEPENDENCY = `${NAMESPACE}/UPDATE_TASK_DEPENDENCY`;
const REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS`;
const CREATE_TASK_DEPENDENCY = `${NAMESPACE}/CREATE_TASK_DEPENDENCY`;
const SET_RELATIVE_PRIORITIZATION = `${NAMESPACE}/SET_RELATIVE_PRIORITIZATION`;
const CLEAR_RELATIVE_PRIORITIZATION = `${NAMESPACE}/CLEAR_RELATIVE_PRIORITIZATION`;

// Reducers

const INITIAL_STATE = {
  tasks: {
    byId: {},
    allIds: [],
  },
  taskDependencies: {
    byId: {},
    allIds: [],
  },
};

export const reducer = createReducer(INITIAL_STATE, {
  [UPDATE_TASK]: (state, { payload: { taskId, updates } }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: filterTaskKeys(addScore({
          ...state.tasks.byId[taskId],
          ...updates,
        }), TASK_KEYS_FOR_REDUX),
      },
    },
  }),
  [UPDATE_TASK_BATCH]: (state, { payload: { updatesByTaskId } }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        ...mapValues(updatesByTaskId, (updates, taskId) => (
          filterTaskKeys(addScore({
            ...state.tasks.byId[taskId],
            ...updates,
          }), TASK_KEYS_FOR_REDUX)
        )),
      },
    },
  }),
  [SET_TASKS]: (state, action) => ({
    ...state,
    tasks: {
      allIds: uniq([
        ...state.tasks.allIds,
        ...action.payload.tasks.allIds,
      ]),
      byId: {
        ...state.tasks.byId,
        ...mapValues(action.payload.tasks.byId, task => (
          filterTaskKeys(addScore(task), TASK_KEYS_FOR_REDUX)
        )),
      },
    },
    taskDependencies: {
      allIds: [
        ...state.taskDependencies.allIds,
        ...action.payload.taskDependencies.allIds,
      ],
      byId: {
        ...state.taskDependencies.byId,
        ...action.payload.taskDependencies.byId,
      },
    },
  }),
  [ADD_TASK]: (state, action) => ({
    ...state,
    tasks: {
      allIds: [...state.tasks.allIds, action.payload.task.id],
      byId: {
        ...state.tasks.byId,
        [action.payload.task.id]: filterTaskKeys(
          addScore(action.payload.task),
          TASK_KEYS_FOR_REDUX,
        ),
      },
    },
  }),
  [REMOVE_TASK_FROM_ALL_IDS]: (state, { payload: { taskId } }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      allIds: state.tasks.allIds.filter(id => id !== taskId),
    },
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
  [UPDATE_TASK_DEPENDENCY]: (state, { payload: { id, blockerId, blockedId } }) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      byId: {
        ...state.taskDependencies.byId,
        [id]: {
          ...state.taskDependencies.byId[id],
          blockerId,
          blockedId,
        },
      },
    },
  }),
  [REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS]: (state, { payload: { taskDependencyId } }) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      allIds: state.taskDependencies.allIds.filter(id => id !== taskDependencyId),
    },
  }),
  [CREATE_TASK_DEPENDENCY]: (state, { payload: { blockerId, blockedId, id } }) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      allIds: [...state.taskDependencies.allIds, id],
      byId: {
        ...state.taskDependencies.byId,
        [id]: {
          id,
          blockerId,
          blockedId,
        },
      },
    },
  }),
  [SET_RELATIVE_PRIORITIZATION]: (
    state,
    { payload: { sourceTaskId = isRequired(), targetTaskId = isRequired() } },
  ) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [sourceTaskId]: {
          ...state.tasks.byId[sourceTaskId],
          prioritizedAheadOf: targetTaskId,
        },
      },
    },
  }),
  [CLEAR_RELATIVE_PRIORITIZATION]: (state, { payload: { taskId } }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: {
          ...state.tasks.byId[taskId],
          prioritizedAheadOf: null,
        },
      },
    },
  }),
});

// Selectors

export const getTask = (state, id) => state[NAMESPACE].tasks.byId[id];

const getNonTrashedTasks = state => (
  state[NAMESPACE].tasks.allIds
    .map(id => state[NAMESPACE].tasks.byId[id])
    .filter(task => task.trashed == null)
);

const getTaskDependency = (state, id) => state[NAMESPACE].taskDependencies.byId[id];

const getTaskDependencies = state => (
  state[NAMESPACE].taskDependencies.allIds
    .map(id => state[NAMESPACE].taskDependencies.byId[id])
);

const getTaskBlockedByIds = (state, taskId) => (
  getTaskDependencies(state)
    .filter(taskDependency => taskDependency.blockedId === taskId)
    .map(({ blockerId }) => blockerId)
    .filter(Boolean)
);

export const getDependenciesForTask = (state, id) => (
  getTaskDependencies(state)
    .filter(({ blockedId, blockerId }) => (blockedId === id || blockerId === id))
);

const getIsTaskBlocked = (state, id) => (
  getTaskDependencies(state)
    .filter(({ blockerId, blockedId }) => {
      const task = getTask(state, blockerId);
      return blockedId === id && task && task.completed == null;
    })
    .length > 0
);

const applyRelativePrioritization = (tasks) => {
  const taskBaseToAheadOf = tasks.reduce((memo, task) => {
    if (task.prioritizedAheadOf) {
      return {
        ...memo,
        [task.prioritizedAheadOf]: [
          ...(memo[task.prioritizedAheadOf] || []),
          task.id,
        ],
      };
    }
    return memo;
  }, {});

  const topTaskIds = tasks.filter(task => !task.prioritizedAheadOf).map(task => task.id);

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

  const taskIdsMissing = difference(tasks.map(task => task.id), updatedTasksIds);

  if (taskIdsMissing.length) {
    console.warn('Failed to prioritize all tasks.', taskIdsMissing);
  }

  const prioritizedTaskIds = taskIdsMissing.length
    ? [...updatedTasksIds, ...taskIdsMissing]
    : updatedTasksIds;

  const tasksById = keyBy(tasks, 'id');
  return prioritizedTaskIds
    .map(id => tasksById[id]);
};

export const getNonCompletedTasks = state => (
  getNonTrashedTasks(state)
    .filter(task => task.completed == null)
);

const getUpcomingSortedTasks = (state) => {
  const now = Date.now();
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.scheduledStart == null || task.scheduledStart <= now)
    .filter(task => !getIsTaskBlocked(state, task.id));
  const tasksSortedByScore = sortBy(tasks, 'score').reverse();
  return applyRelativePrioritization(tasksSortedByScore);
};

export const getNowTasks = (state) => {
  const sortedTasks = getUpcomingSortedTasks(state);
  return sortedTasks.slice(0, NOW_TASKS_LIMIT);
};
export const getNextTasks = (state) => {
  const sortedTasks = getUpcomingSortedTasks(state);
  return sortedTasks.slice(NOW_TASKS_LIMIT);
};
export const getBlockedTasks = (state) => {
  const taskDependencies = getTaskDependencies(state);
  const blockedTaskIds = taskDependencies
    .filter(({ blockerId }) => {
      const blockerTask = getTask(state, blockerId);
      return blockerTask && blockerTask.completed == null;
    })
    .map(({ blockedId }) => blockedId);
  const blockedTasks = uniq(blockedTaskIds)
    .map(id => getTask(state, id));
  return sortBy(blockedTasks, 'score').reverse();
};
export const getScheduledTasks = (state) => {
  const now = Date.now();
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.scheduledStart != null && task.scheduledStart > now);
  return sortBy(tasks, 'scheduledStart');
};
export const getCompletedTasks = (state) => {
  const tasks = state[NAMESPACE].tasks.allIds
    .map(id => state[NAMESPACE].tasks.byId[id])
    .filter(task => task.completed != null);
  return sortBy(tasks, 'completed').reverse();
};
export const getTasksBlockingGivenTask = (state, blockedTaskId) => {
  const blockedByIds = getTaskBlockedByIds(state, blockedTaskId);
  const blockingTasks = blockedByIds
    .map(blockerId => getTask(state, blockerId))
    .filter(Boolean);
  return sortBy(blockingTasks, 'score').reverse();
};
export const getUndeletedTask = (state, id) => {
  const task = getTask(state, id);
  return !task || task.trashed ? undefined : task;
};
export const getTasksForDependencySelection = (state, id) => (
  getNonCompletedTasks(state)
    .filter(task => task.id !== id)
);
const getTasksPrioritizedAheadOf = (state, id) => (
  getNonCompletedTasks(state)
    .filter(task => task.prioritizedAheadOf === id)
);

// Actions

const normalizeTasks = (rawTasks) => {
  const tasksAllIds = rawTasks.map(task => task.id);
  const tasksById = rawTasks.reduce((memo, { blockedBy, ...task }) => ({
    ...memo,
    [task.id]: {
      id: task.id,
      ...task,
    },
  }), {});
  const tasks = {
    allIds: tasksAllIds,
    byId: tasksById,
  };

  const taskDependencies = {
    byId: {},
    allIds: [],
  };
  rawTasks.forEach(({ blockedBy, id: blockedId }) => {
    (blockedBy || []).forEach((descriptor) => {
      // Skip blockers that aren't tasks.
      if (descriptor.type !== blockerTypes.TASK) {
        return;
      }
      if (!descriptor.config || !descriptor.config.taskId) {
        console.warn("normalizeTasks - blockedBy descriptor didn't have config", descriptor);
        return;
      }
      const blockerId = descriptor.config.taskId;
      // if there's no task, skip it.
      if (!tasks.byId[blockerId]) {
        return;
      }

      const dependencyId = generateId();
      taskDependencies.allIds.push(dependencyId);
      taskDependencies.byId[dependencyId] = {
        id: dependencyId,
        blockerId,
        blockedId,
      };
    });
  });

  return { tasks, taskDependencies };
};

export const resetLoadedTasks = () => ({ type: RESET });

export const setTasks = (tasks) => {
  const parsedTasks = tasks.map((task) => {
    const impact = toInt(task.impact, null);
    const effort = toInt(task.effort, null);
    return {
      ...task,
      blockedBy: (task.blockedBy || []).filter(Boolean),
      impact,
      effort,
      id: `${task.id}`,
    };
  });
  const normalizedEntities = normalizeTasks(parsedTasks);
  return {
    type: SET_TASKS,
    payload: { ...normalizedEntities },
  };
};

export const updateTask = (taskId, updates) => (dispatch) => {
  dispatch({
    type: UPDATE_TASK,
    payload: { taskId, updates },
  });
  return apiClient.updateTask(taskId, filterTaskKeys(updates, TASK_KEYS_FOR_API));
};
export const updateTaskBatch = updatesByTaskId => (dispatch) => {
  dispatch({
    type: UPDATE_TASK_BATCH,
    payload: { updatesByTaskId },
  });
  return apiClient.updateTaskBatch(
    mapValues(updatesByTaskId, updates => filterTaskKeys(updates, TASK_KEYS_FOR_API)),
  );
};
export const moveToTrashTask = taskId => (dispatch) => {
  dispatch({
    type: REMOVE_TASK_FROM_ALL_IDS,
    payload: { taskId },
  });
  const notificationUid = dispatch(showInfoNotification('Task deleted'));
  return dispatch(updateTask(taskId, { trashed: Date.now() }))
    .catch((error) => {
      console.error(error);
      dispatch(hideNotification(notificationUid));
      dispatch(showNetworkErrorNotification());
    });
};

export const removeTaskFromAllIds = taskId => ({
  type: REMOVE_TASK_FROM_ALL_IDS,
  payload: { taskId },
});

export const undoCompletedTask = taskId => updateTask(taskId, { completed: null });
export const completeTask = taskId => (dispatch) => {
  const notificationUid = dispatch(showInfoNotification('Task completed! 🎉', {
    callbackButton: 'Undo',
    callbackFunction: () => undoCompletedTask(taskId),
  }));
  return dispatch(updateTask(taskId, { completed: Date.now() }))
    .catch((error) => {
      console.error(error);
      dispatch(hideNotification(notificationUid));
      dispatch(showNetworkErrorNotification());
    });
};

export const loadTasks = fetchParams => (dispatch, getState, { getLoggedInUserUid }) => {
  const userId = getLoggedInUserUid();
  return apiClient.fetchTasks(userId, fetchParams)
    .then((tasks) => {
      dispatch(setTasks(tasks));
    });
};

export const updateTaskDependency = (id, blockerId, blockedId) => (dispatch, getState) => {
  const oldState = getState();

  dispatch({
    type: UPDATE_TASK_DEPENDENCY,
    payload: { id, blockerId, blockedId },
  });

  const newState = getState();

  const oldDependency = getTaskDependency(oldState, id);
  const newDependency = getTaskDependency(newState, id);

  const taskIds = uniq([
    oldDependency.blockerId,
    oldDependency.blockedId,
    newDependency.blockerId,
    newDependency.blockedId,
  ].filter(taskId => taskId && getTask(newState, taskId) && !isTemporaryId(taskId)));

  const promises = taskIds.map((taskId) => {
    const newBlockedByArray = getTaskBlockedByIds(newState, taskId);
    const oldBlockedByArray = getTaskBlockedByIds(oldState, taskId);
    if (isEqual(oldBlockedByArray, newBlockedByArray)) {
      return Promise.resolve();
    }

    const blockedByToSave = newBlockedByArray.map(blockedById => ({
      type: blockerTypes.TASK,
      config: {
        taskId: blockedById,
      },
    }));

    return apiClient.updateTask(
      taskId,
      filterTaskKeys({ blockedBy: blockedByToSave }, TASK_KEYS_FOR_API),
    );
  });

  return Promise.all(promises)
    .catch((error) => {
      console.error(error);
      dispatch(showNetworkErrorNotification());
    });
};

export const removeTaskDependency = id => (dispatch, getState) => {
  const oldState = getState();
  const dependency = getTaskDependency(oldState, id);

  dispatch({
    type: REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS,
    payload: { taskDependencyId: id },
  });

  // If the dependency didn't have a blockedId, nothing to change (maybe it was just created)
  if (!dependency.blockedId) {
    return Promise.resolve();
  }

  const newState = getState();
  const newBlockedByArray = getTaskBlockedByIds(newState, dependency.blockedId);
  return apiClient.updateTask(
    dependency.blockedId,
    filterTaskKeys({ blockedBy: newBlockedByArray }, TASK_KEYS_FOR_API),
  )
    .catch((error) => {
      console.error(error);
      dispatch(showNetworkErrorNotification());
    });
};

// create doesn't save to the API at the moment because for adding it needs to be modified
export const createTaskDependency = (blockerId = isRequired(), blockedId = isRequired()) => ({
  type: CREATE_TASK_DEPENDENCY,
  payload: { blockerId, blockedId, id: generateId() },
});

export const updateIdInAllTaskDependencies = (oldId = isRequired(), newId = isRequired()) => (
  (dispatch, getState) => {
    const state = getState();
    const taskDependenciesToUpdate = getTaskDependencies(state)
      .filter(dependency => dependency.blockerId === oldId || dependency.blockedId === oldId);

    taskDependenciesToUpdate.forEach(({ id, blockerId, blockedId }) => {
      dispatch(updateTaskDependency(
        id,
        blockerId === oldId ? newId : blockerId,
        blockedId === oldId ? newId : blockedId,
      ));
    });
  }
);

export const addTask = ({
  temporaryId = generateId(),
  title = isRequired(),
  effort = isRequired(),
  impact = isRequired(),
  description = isRequired(),
  ...restAttributes
}) => (dispatch, getState, { getLoggedInUserUid }) => {
  const task = {
    ...TASK_KEY_DEFAULTS,
    ...restAttributes,
    id: temporaryId,
    title,
    effort,
    impact,
    description,
    completed: null,
    created: Date.now(),
    userId: getLoggedInUserUid(),
  };

  dispatch({
    type: ADD_TASK,
    payload: {
      task: filterTaskKeys(task, TASK_KEYS_FOR_REDUX),
    },
  });

  const taskWithoutId = omit(task, ['id']);

  return apiClient.createTask(filterTaskKeys(taskWithoutId, TASK_KEYS_FOR_API))
    .then(({ id }) => {
      dispatch(removeTaskFromAllIds(temporaryId));
      dispatch({
        type: ADD_TASK,
        payload: {
          task: {
            ...task,
            id,
          },
        },
      });
      dispatch(updateIdInAllTaskDependencies(temporaryId, id));
    })
    .catch((error) => {
      console.error(error);
      dispatch(showNetworkErrorNotification());
      dispatch(removeTaskFromAllIds(temporaryId));
    });
};

export const setRelativePrioritization = (sourceTaskId, sourceIndex, destinationIndex) => (
  (dispatch, getState) => {
    const realDestinationIndex = sourceIndex < destinationIndex
      ? destinationIndex + 1
      : destinationIndex;

    const state = getState();
    const allTasks = getUpcomingSortedTasks(state);

    if (realDestinationIndex >= allTasks.length || !allTasks[realDestinationIndex]) {
      dispatch(showErrorNotification('Operation not supported'));
      return;
    }

    const targetTaskId = allTasks[realDestinationIndex].id;

    if (targetTaskId === sourceTaskId) {
      return; // nothing to do on this case, the task is already where it needs to be.
    }

    // If there are other tasks depending on the one that is going to be moved,
    // we're going to associate them to the next one, so that they stay on the same spot.
    const tasksPrioritizedBefore = getTasksPrioritizedAheadOf(state, sourceTaskId);
    const taskAfter = allTasks[sourceIndex + 1];

    const updatesByTaskId = {
      [sourceTaskId]: { prioritizedAheadOf: targetTaskId },
      ...tasksPrioritizedBefore.reduce((memo, task) => ({
        ...memo,
        [task.id]: { prioritizedAheadOf: taskAfter.id },
      }), {}),
    };

    dispatch(updateTaskBatch(updatesByTaskId));
  }
);

export const clearRelativePrioritization = taskId => updateTask(taskId, {
  prioritizedAheadOf: null,
});
