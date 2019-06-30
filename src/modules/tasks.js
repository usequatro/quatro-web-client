import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';
import createReducer from '../util/createReducer';
import isRequired from '../util/isRequired';
import * as apiClient from './apiClient';
import { showInfoNotification, showNetworkErrorNotification, hideNotification } from './notification';

export const NAMESPACE = 'tasks';

const TASK_KEYS = {
  id: true,
  title: true,
  effort: true,
  impact: true,
  description: true,
  created: true,
  due: true,
  scheduledStart: true,
  completed: true,
  blockers: true,
  score: true,
  trashed: true,
  userId: true,
};

// Action types

const SET_TASKS = `${NAMESPACE}/SET_TASKS`;
const ADD_TASK = `${NAMESPACE}/ADD_TASK`;
const REMOVE_TASK_FROM_ALL_IDS = `${NAMESPACE}/REMOVE_TASK_FROM_ALL_IDS`;
const UPDATE_TASK = `${NAMESPACE}/UPDATE_TASK`;
const SET_LOAD_FLAGS = `${NAMESPACE}/SET_LOAD_FLAGS`;
const RESET = `${NAMESPACE}/RESET`;

// Actions

const calculateScore = (impact, effort) => impact * impact * effort;

const filterTaskKeys = (task) => {
  const filteredTask = Object.entries(task).reduce((memo, [key, value]) => {
    if (!TASK_KEYS[key]) {
      console.warn(`[tasks] Unknown key "${key}" with value "${value}" in task ${task.id}`);
      return memo;
    }
    return { ...memo, [key]: value };
  }, {});
  return filteredTask;
};

const simpleNormalize = (inputs) => {
  const result = [];
  const entities = {};

  inputs.forEach((input) => {
    result.push(input.id);
    entities[input.id] = input;
  });

  return { result, entities };
};

const setLoadFlags = ({ loaded, loading }) => ({
  type: SET_LOAD_FLAGS,
  payload: { loaded, loading },
});

export const resetLoadedTasks = () => ({ type: RESET });

export const setTasks = (tasks) => {
  const parsedTasks = tasks.map(task => ({
    ...task,
    score: calculateScore(task.impact, task.effort),
    id: `${task.id}`,
  }));
  const normalizedTasks = simpleNormalize(parsedTasks);
  return {
    type: SET_TASKS,
    payload: { tasks: normalizedTasks },
  };
};

export const updateTask = (taskId, updates) => (dispatch) => {
  dispatch({
    type: UPDATE_TASK,
    payload: { taskId, updates },
  });
  return apiClient.updateTask(taskId, filterTaskKeys(updates));
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

export const addTask = ({
  title = isRequired(),
  effort = isRequired(),
  impact = isRequired(),
  description = isRequired(),
  ...restAttributes
}) => (dispatch, getState, { getLoggedInUserUid }) => {
  const task = {
    ...filterTaskKeys(restAttributes),
    title,
    effort,
    impact,
    description,
    completed: null,
    created: Date.now(),
    blockers: [],
    userId: getLoggedInUserUid(),
  };
  const score = calculateScore(impact, effort);
  const tempId = `${Math.round(Math.random() * 100000)}`;

  dispatch({
    type: ADD_TASK,
    payload: {
      task: {
        ...task,
        id: tempId,
        score,
      },
    },
  });

  return apiClient.createTask(filterTaskKeys(task))
    .then(({ id }) => {
      dispatch(removeTaskFromAllIds(tempId));
      dispatch({
        type: ADD_TASK,
        payload: {
          task: {
            ...task,
            id,
            score,
          },
        },
      });
    })
    .catch((error) => {
      console.error(error);
      dispatch(showNetworkErrorNotification());
      dispatch(removeTaskFromAllIds(tempId));
    });
};

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

export const loadTasks = () => (dispatch, getState, { getLoggedInUserUid }) => {
  const userId = getLoggedInUserUid();

  dispatch(setLoadFlags({ loading: true, loaded: false }));

  return apiClient.fetchTasks(userId)
    .then((tasks) => {
      dispatch(setTasks(tasks));
      dispatch(setLoadFlags({ loading: false, loaded: true }));
    })
    .catch((error) => {
      console.error(error);
      dispatch(setLoadFlags({ loading: false, loaded: false }));
    });
};

// Reducers

const INITIAL_STATE = {
  loading: true,
  loaded: false,
  result: [],
  entities: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [UPDATE_TASK]: (state, { payload: { taskId, updates } }) => ({
    ...state,
    entities: {
      ...state.entities,
      [taskId]: { ...state.entities[taskId], ...filterTaskKeys(updates) },
    },
  }),
  [SET_LOAD_FLAGS]: (state, { payload: { loading, loaded } }) => ({
    ...state,
    loading,
    loaded,
  }),
  [SET_TASKS]: (state, action) => ({
    ...state,
    result: [...action.payload.tasks.result],
    entities: { ...mapValues(action.payload.tasks.entities, filterTaskKeys) },
  }),
  [ADD_TASK]: (state, action) => ({
    ...state,
    result: [...state.result, action.payload.task.id],
    entities: {
      ...state.entities,
      [action.payload.task.id]: filterTaskKeys(action.payload.task),
    },
  }),
  [REMOVE_TASK_FROM_ALL_IDS]: (state, { payload: { taskId } }) => ({
    ...state,
    result: state.result.filter(id => id !== taskId),
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

const BACKLOG_SCORE_THRESHOLD = 50;
const IMPORTANT_TASKS_LIMIT = 7;
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
  state[NAMESPACE].result
    .map(id => state[NAMESPACE].entities[id])
    .filter(task => task.trashed == null)
);

const getNonCompletedTasks = state => (
  getNonTrashedTasks(state)
    .filter(task => task.completed == null)
);

export const getLoading = state => state[NAMESPACE].loading;
export const getLoaded = state => state[NAMESPACE].loaded;
export const getTask = (state, id) => state[NAMESPACE].entities[id];
export const getImportantTasks = (state) => {
  const tasks = getNonCompletedTasks(state);
  const tasksSortedByScore = sortBy(tasks, 'score').reverse();
  const tasksDueToday = tasks.filter(task => task.due && isToday(task.due));
  const tasksSortedByScoreToPick = Math.max(0, IMPORTANT_TASKS_LIMIT - tasksDueToday.length);
  return [
    ...tasksDueToday,
    ...differenceTaskArrays(tasksSortedByScore, tasksDueToday).slice(0, tasksSortedByScoreToPick),
  ];
};
export const getBacklogTasks = (state) => {
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.score < BACKLOG_SCORE_THRESHOLD);
  return sortBy(tasks, 'score').reverse();
};
export const getBlockedTasks = (state) => {
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.blockers.length > 0);
  return sortBy(tasks, 'score').reverse();
};
export const getScheduledTasks = (state) => {
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.scheduledStart != null);
  return sortBy(tasks, 'scheduledStart');
};
export const getCompletedTasks = (state) => {
  const tasks = state[NAMESPACE].result
    .map(id => state[NAMESPACE].entities[id])
    .filter(task => task.completed != null);
  return sortBy(tasks, 'completed').reverse();
};
export const getBlockingTasks = (state, blockedTaskId) => {
  const task = getTask(state, blockedTaskId);
  const blockingTasks = task.blockers.map(id => getTask(state, id));
  return sortBy(blockingTasks, 'score').reverse();
};
export const getUndeletedTask = (state, id) => {
  const task = getTask(state, id);
  return !task || task.trashed ? undefined : task;
};
