import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import uuid from 'uuid/v4';
import createReducer from '../util/createReducer';
import isRequired from '../util/isRequired';
import * as apiClient from './apiClient';
import { showInfoNotification, showNetworkErrorNotification, hideNotification } from './notification';

export const NAMESPACE = 'tasks';

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
};
const TASK_KEYS_FOR_API = {
  ...omit(TASK_KEYS_FOR_REDUX, ['id', 'score']),
  blockedBy: true,
};

// Utilities

const generateId = (prefix = '') => `${prefix}${uuid()}`;

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

const FACTOR = 2.0409; // factor to make score between 0 and 100;
const calculateScore = (impact, effort) => (Number.isInteger(impact) && Number.isInteger(effort)
  ? Math.round(FACTOR * (impact * impact) / effort)
  : 0);
const addScore = task => ({
  ...task,
  score: calculateScore(task.impact, task.effort),
});

const toInt = (value, fallback) => (!Number.isNaN(Number.parseInt(value, 10))
  ? Number.parseInt(value, 10)
  : fallback);

// Action types

const SET_TASKS = `${NAMESPACE}/SET_TASKS`;
const ADD_TASK = `${NAMESPACE}/ADD_TASK`;
const REMOVE_TASK_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_FROM_ALL_IDS`;
const UPDATE_TASK = `${NAMESPACE}/UPDATE_TASK`;
const RESET = `${NAMESPACE}/RESET`;
const UPDATE_TASK_DEPENDENCY = `${NAMESPACE}/UPDATE_TASK_DEPENDENCY`;
const REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_DEPENDENCY_FROM_ALL_IDS`;
const CREATE_TASK_DEPENDENCY = `${NAMESPACE}/CREATE_TASK_DEPENDENCY`;

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
  [SET_TASKS]: (state, action) => ({
    ...state,
    tasks: {
      allIds: [
        ...state.tasks.allIds,
        ...action.payload.tasks.allIds,
      ],
      byId: {
        ...state.tasks.byId,
        ...mapValues(action.payload.tasks.byId, addScore),
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
});

// Selectors

const NEXT_SCORE_THRESHOLD = 50;
const NOW_TASKS_LIMIT = 7;
const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  return now.getFullYear() === date.getFullYear()
    && now.getMonth() === date.getMonth()
    && now.getDate() === date.getDate();
};
const differenceTaskArrays = (tasks1, tasks2) => {
  const idsInTasks2 = tasks2.reduce((memo, task) => ({
    ...memo, [task.id]: true,
  }), {});
  return tasks1.filter(task => !idsInTasks2[task.id]);
};

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

export const getNonCompletedTasks = state => (
  getNonTrashedTasks(state)
    .filter(task => task.completed == null)
);

export const getTask = (state, id) => state[NAMESPACE].tasks.byId[id];
export const getNowTasks = (state) => {
  const now = Date.now();
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.scheduledStart == null || task.scheduledStart <= now);
  const tasksSortedByScore = sortBy(tasks, 'score').reverse();
  const tasksDueToday = tasks.filter(task => task.due && isToday(task.due));
  const tasksSortedByScoreToPick = Math.max(0, NOW_TASKS_LIMIT - tasksDueToday.length);
  return [
    ...tasksDueToday,
    ...differenceTaskArrays(tasksSortedByScore, tasksDueToday).slice(0, tasksSortedByScoreToPick),
  ];
};
export const getNextTasks = (state) => {
  const now = Date.now();
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.scheduledStart == null || task.scheduledStart <= now)
    .filter(task => task.score < NEXT_SCORE_THRESHOLD);
  return sortBy(tasks, 'score').reverse();
};
export const getBlockedTasks = (state) => {
  const taskDependencies = getTaskDependencies(state);
  const blockedTaskIds = taskDependencies.map(({ blockedId }) => blockedId);
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
  const blockingTasks = blockedByIds.map(blockerId => getTask(state, blockerId));
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

// Actions

const normalizeTasks = (rawTasks) => {
  const tasks = {
    byId: {},
    allIds: [],
  };
  const taskDependencies = {
    byId: {},
    allIds: [],
  };

  rawTasks.forEach((task) => {
    tasks.allIds.push(task.id);
    tasks.byId[task.id] = {
      id: task.id,
      ...task,
    };

    (task.blockedBy || []).forEach((blockerIds) => {
      const dependencyId = generateId('_');
      taskDependencies.allIds.push(dependencyId);
      taskDependencies.byId[dependencyId] = {
        id: dependencyId,
        blockerId: blockerIds,
        blockedId: task.id,
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
export const moveToTrashTask = taskId => (dispatch) => {
  dispatch({
    type: REMOVE_TASK_FROM_ALL_IDS,
    payload: { taskId },
  });
  return dispatch(updateTask(taskId, { trashed: Date.now() }));
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
  ].filter(taskId => taskId && getTask(newState, taskId)));

  const promises = taskIds.map((taskId) => {
    const newBlockedByArray = getTaskBlockedByIds(newState, taskId);
    const oldBlockedByArray = getTaskBlockedByIds(oldState, taskId);
    if (isEqual(oldBlockedByArray, newBlockedByArray)) {
      return Promise.resolve();
    }
    return apiClient.updateTask(
      taskId,
      filterTaskKeys({ blockedBy: newBlockedByArray }, TASK_KEYS_FOR_API),
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
export const createTaskDependency = (blockerId, blockedId) => ({
  type: CREATE_TASK_DEPENDENCY,
  payload: { blockerId, blockedId, id: generateId() },
});

export const updateIdInAllTaskDependencies = (oldId, newId) => (dispatch, getState) => {
  const state = getState();
  const taskDependenciesToUpdate = getTaskDependencies(state)
    .filter(dependency => dependency.blockerId === oldId || dependency.blockedId === oldId);

  taskDependenciesToUpdate.forEach(({ id, blockerId, blockedId }) => {
    updateTaskDependency({
      id,
      blockerId: blockerId === oldId ? newId : blockerId,
      blockedId: blockedId === oldId ? newId : blockedId,
    });
  });
};

export const addTask = ({
  temporaryId = generateId('_'),
  title = isRequired(),
  effort = isRequired(),
  impact = isRequired(),
  description = isRequired(),
  ...restAttributes
}) => (dispatch, getState, { getLoggedInUserUid }) => {
  const task = {
    ...filterTaskKeys(restAttributes, TASK_KEYS_FOR_REDUX),
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
      task: {
        ...task,
        id: temporaryId,
      },
    },
  });

  return apiClient.createTask(filterTaskKeys(task, TASK_KEYS_FOR_API))
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
