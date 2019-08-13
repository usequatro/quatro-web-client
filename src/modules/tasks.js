import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';
import findIndex from 'lodash/findIndex';
import uuid from 'uuid/v4';
import createReducer from '../util/createReducer';
import isRequired from '../util/isRequired';
import * as apiClient from './apiClient';
import NOW_TASKS_LIMIT from '../constants/nowTasksLimit';
import { TASK, FREE_TEXT } from '../constants/dependencyTypes';
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
  dependencyIds: [],
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
  dependencyIds: true,
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
// const isTemporaryId = id => /^_/.test(id);

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
const REMOVE_TASK_DEPENDENCY = `${NAMESPACE}/REMOVE_TASK_DEPENDENCY`;
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
  [UPDATE_TASK_DEPENDENCY]: (state, { payload: { id, updates } }) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      byId: {
        ...state.taskDependencies.byId,
        [id]: {
          ...state.taskDependencies.byId[id],
          ...updates,
        },
      },
    },
  }),
  [REMOVE_TASK_DEPENDENCY]: (state, { payload: { dependencyId, taskId } }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: {
          ...state.tasks.byId[taskId],
          dependencyIds: state.tasks.byId[taskId].dependencyIds.filter(id => id !== dependencyId),
        },
      },
    },
    taskDependencies: {
      ...state.taskDependencies,
      allIds: state.taskDependencies.allIds.filter(id => id !== dependencyId),
    },
  }),
  [CREATE_TASK_DEPENDENCY]: (
    state,
    { payload: { dependency = isRequired(), id = isRequired(), taskId = isRequired() } },
  ) => ({
    ...state,
    taskDependencies: {
      ...state.taskDependencies,
      allIds: [...state.taskDependencies.allIds, id],
      byId: {
        ...state.taskDependencies.byId,
        [id]: {
          ...dependency,
          id,
          taskId,
        },
      },
    },
    tasks: {
      ...state.tasks,
      byId: {
        ...state.tasks.byId,
        [taskId]: {
          ...state.tasks.byId[taskId],
          dependencyIds: [
            ...state.tasks.byId[taskId].dependencyIds,
            id,
          ],
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

export const getTasks = (state, ids = null) => (
  (ids || state[NAMESPACE].tasks.allIds)
    .map(id => getTask(state, id))
);

const getNonTrashedTasks = state => (
  state[NAMESPACE].tasks.allIds
    .map(id => state[NAMESPACE].tasks.byId[id])
    .filter(task => task.trashed == null)
);

export const getTaskDependency = (state, id) => state[NAMESPACE].taskDependencies.byId[id];

export const getTaskDependencies = (state, ids = null) => (
  (ids || state[NAMESPACE].taskDependencies.allIds)
    .map(id => getTaskDependency(state, id))
);

const getIsTaskBlocked = (state, taskId) => {
  const task = getTask(state, taskId);
  const dependencies = task.dependencyIds.map(id => getTaskDependency(state, id));
  const nonCompletedDependencies = dependencies
    .filter(dependency => (
      !(dependency.type === TASK && !getTask(state, dependency.config.taskId))
    ));
  return nonCompletedDependencies.length > 0;
};

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
  const tasks = getNonCompletedTasks(state);
  const tasksWithBlockers = tasks.filter(task => task.dependencyIds.length);
  const tasksWithExistingBlockers = tasksWithBlockers
    .filter((task) => {
      const dependencies = task.dependencyIds.map(id => getTaskDependency(state, id));
      const nonCompletedDependencies = dependencies
        .filter(dependency => (
          !(dependency.type === TASK && !getTask(state, dependency.config.taskId))
        ));
      return nonCompletedDependencies.length;
    });

  const blockedTaskIds = tasksWithExistingBlockers.map(task => task.id);
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
export const getDependenciesBlockingGivenTask = (state, blockedTaskId) => {
  const task = getTask(state, blockedTaskId);
  const { dependencyIds = [] } = task || {};

  const dependencies = dependencyIds.map(id => getTaskDependency(state, id));

  const dependenciesAndTasks = dependencies.reduce((memo, dependency) => {
    if (dependency.type === FREE_TEXT) {
      return [
        ...memo,
        [dependency, null],
      ];
    } if (dependency.type === TASK) {
      const dependencyTask = getTask(state, dependency.config.taskId);
      if (dependencyTask) {
        return [
          ...memo,
          [dependency, dependencyTask],
        ];
      }
      return memo;
    }
    throw new Error(`Dependency type not supported ${dependency.type}`);
  }, []);

  return dependenciesAndTasks;
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
      dependencyIds: [],
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
  rawTasks.forEach(({ id, blockedBy }) => {
    (blockedBy || []).forEach((dependency) => {
      const dependencyId = generateId();
      const dependencyWithBackwardsRelationship = {
        id: dependencyId,
        taskId: id,
        ...dependency,
      };

      taskDependencies.allIds.push(dependencyId);
      taskDependencies.byId[dependencyId] = dependencyWithBackwardsRelationship;

      tasksById[id].dependencyIds.push(dependencyId);
    });
  });

  return { tasks, taskDependencies };
};

const serializeTask = (state, id) => {
  const normalizedTask = getTask(state, id);
  const {
    dependencyIds,
    id: taskId,
    score,
    ...restData
  } = normalizedTask;

  const blockedBy = dependencyIds
    .map(dependencyId => getTaskDependency(state, dependencyId))
    .map(dependency => omit(dependency, ['id', 'taskId']));

  const serializedTask = {
    ...restData,
    blockedBy,
  };

  return serializedTask;
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

const updateRelativePrioritizationToNext = (taskId, offset) => (dispatch, getState) => {
  const state = getState();

  const tasksRelativelyPrioritized = getTasksPrioritizedAheadOf(state, taskId);
  const allOriginalTasks = tasksRelativelyPrioritized.length ? getUpcomingSortedTasks(state) : [];
  const taskIndex = findIndex(allOriginalTasks, task => task.id === taskId);
  const newTaskIndex = taskIndex + offset;
  const newTaskAfter = allOriginalTasks[newTaskIndex];

  tasksRelativelyPrioritized.forEach((task) => {
    dispatch(updateTask(task.id, {
      prioritizedAheadOf: newTaskAfter ? newTaskAfter.id : null,
    }));
  });

  // return undo.
  return () => () => {
    tasksRelativelyPrioritized.forEach((task) => {
      dispatch(updateTask(task.id, {
        prioritizedAheadOf: task.prioritizedAheadOf,
      }));
    });
  };
};

export const moveToTrashTask = taskId => (dispatch) => {
  // Relative prioritization: Any task that was set to go before this one should now go after next.
  dispatch(updateRelativePrioritizationToNext(taskId, +1));

  dispatch({
    type: REMOVE_TASK_FROM_ALL_IDS,
    payload: { taskId },
  });

  const notificationUid = dispatch(showInfoNotification('Task deleted'));
  return dispatch(updateTask(taskId, { trashed: Date.now() }))
    .catch((error) => {
      console.warn(error);
      dispatch(hideNotification(notificationUid));
      dispatch(showNetworkErrorNotification());
    });
};

export const removeTaskFromAllIds = taskId => ({
  type: REMOVE_TASK_FROM_ALL_IDS,
  payload: { taskId },
});

export const undoCompletedTask = taskId => dispatch => (
  dispatch(updateTask(taskId, { completed: null }))
);

export const completeTask = taskId => (dispatch) => {
  // Relative prioritization: Any task that was set to go before this one should now go after next.
  const undoPrioritizationChange = dispatch(updateRelativePrioritizationToNext(taskId, +1));

  const notificationUid = dispatch(showInfoNotification('Task completed! 🎉', {
    callbackButton: 'Undo',
    callbackFunction: () => () => {
      dispatch(undoCompletedTask(taskId));
      dispatch(undoPrioritizationChange());
    },
  }));
  return dispatch(updateTask(taskId, { completed: Date.now() }))
    .catch((error) => {
      console.warn(error);
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

export const persistTask = id => (dispatch, getState) => {
  const state = getState();
  const serializedTask = serializeTask(state, id);
  return apiClient.updateTask(
    id,
    filterTaskKeys(serializedTask, TASK_KEYS_FOR_API),
  );
};

export const updateTaskDependency = (id, updates) => (dispatch, getState) => {
  dispatch({
    type: UPDATE_TASK_DEPENDENCY,
    payload: {
      id,
      updates,
    },
  });
  const state = getState();
  const dependency = getTaskDependency(state, id);
  return dispatch(persistTask(dependency.taskId));
};

export const removeTaskDependency = id => (dispatch, getState) => {
  const state = getState();
  const dependency = getTaskDependency(state, id);

  dispatch({
    type: REMOVE_TASK_DEPENDENCY,
    payload: {
      taskId: dependency.taskId,
      dependencyId: id,
    },
  });

  return dispatch(persistTask(dependency.taskId));
};

// create doesn't save to the API at the moment because for adding it needs to be modified
export const createTaskDependency = (dependency = isRequired('dependency')) => {
  const {
    id = isRequired('id'),
    taskId = isRequired('taskId'),
    ...restFields
  } = dependency;
  return {
    type: CREATE_TASK_DEPENDENCY,
    payload: {
      id,
      taskId,
      dependency: {
        ...restFields,
      },
    },
  };
};

// export const updateIdInAllTaskDependencies = (oldId = isRequired(), newId = isRequired()) => (
//   (dispatch, getState) => {
//     const state = getState();
//     const taskDependenciesToUpdate = getTaskDependencies(state)
//       .map(dependency => (
//         dependency.taskId !== oldId
//           ? dependency
//           : { ...dependency, taskId: newId }
//       )


//     taskDependenciesToUpdate.forEach(({ id, blockerId, blockedId }) => {
//       dispatch(updateTaskDependency(
//         id,
//         blockerId === oldId ? newId : blockerId,
//         blockedId === oldId ? newId : blockedId,
//       ));
//     });
//   }
// );

export const addTask = (newTask, dependencies) => (dispatch, getState, { getLoggedInUserUid }) => {
  const {
    temporaryId = isRequired(),
    title = isRequired(),
    effort = isRequired(),
    impact = isRequired(),
    description = isRequired(),
    ...restAttributes
  } = newTask;

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
    dependencyIds: dependencies.map(({ id = isRequired('dependency id') }) => id),
  };

  dispatch({
    type: ADD_TASK,
    payload: {
      task: filterTaskKeys(task, TASK_KEYS_FOR_REDUX),
    },
  });
  dependencies.map(dependency => dispatch(createTaskDependency(dependency)));

  const taskWithoutId = omit(task, ['id']);

  return apiClient.createTask(filterTaskKeys(taskWithoutId, TASK_KEYS_FOR_API))
    .then(({ id: finalId }) => {
      dispatch(removeTaskFromAllIds(temporaryId));
      dispatch({
        type: ADD_TASK,
        payload: {
          task: {
            ...task,
            id: finalId,
          },
        },
      });
      dependencies.forEach((dependency) => {
        dispatch(updateTaskDependency(dependency.id, {
          ...dependency,
          taskId: finalId,
        }));
      });
    })
    .catch((error) => {
      console.warn(error);
      dispatch(showNetworkErrorNotification());
      dispatch(removeTaskFromAllIds(temporaryId));
    });
};

export const clearRelativePrioritization = taskId => updateTask(taskId, {
  prioritizedAheadOf: null,
});
