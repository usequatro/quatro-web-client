import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';
import createReducer from '../util/createReducer';
import * as apiClient from './apiClient';

export const NAMESPACE = 'tasks';

const TASK_KEYS = {
  id: true,
  title: true,
  effort: true,
  impact: true,
  description: true,
  due: true,
  scheduledStart: true,
  completed: true,
  blockers: true,
  score: true,
  trashed: true,
};

// Action types

const SET_TASKS = 'SET_TASKS';
const ADD_TASK = 'ADD_TASK';
const TRASH_TASK = 'TRASH_TASK';
const UPDATE_TASK = 'UPDATE_TASK';
const SET_LOAD_FLAGS = 'SET_LOAD_FLAGS';

// Actions

const calculateScore = (impact, effort) => impact * impact * effort;

const filterTaskKeys = (task) => {
  const filteredTask = Object.entries(task).reduce((memo, [key, value]) => {
    if (!TASK_KEYS[key]) {
      console.warn(`[tasks] Unknown key ${key} with value ${value}`);
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

const isRequired = (param) => {
  if (param === undefined) {
    throw new Error('missing required parameter');
  }
};

const setLoadFlags = ({ loaded, loading }) => ({
  type: SET_LOAD_FLAGS,
  payload: { loaded, loading },
});

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
  apiClient.updateTask(taskId, filterTaskKeys(updates));
  dispatch({
    type: UPDATE_TASK,
    payload: { taskId, updates },
  });
};
export const moveToTrashTask = taskId => (dispatch) => {
  dispatch(updateTask(taskId, { trashed: Date.now() }));
  dispatch({
    type: TRASH_TASK,
    payload: { taskId },
  });
};

export const addTask = ({
  title = isRequired(),
  effort = isRequired(),
  impact = isRequired(),
  description = isRequired(),
}) => (dispatch) => {
  const task = {
    title,
    effort,
    impact,
    description,
    completed: null,
    blockers: [],
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

  apiClient.createTask(filterTaskKeys(task))
    .then(({ id }) => {
      dispatch(moveToTrashTask(tempId));
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
    });
};


export const completeTask = taskId => updateTask(taskId, { completed: Date.now() });

export const loadTasks = () => (dispatch) => {
  dispatch(setLoadFlags({ loading: true, loaded: false }));
  apiClient.fetchTasks()
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
  [TRASH_TASK]: (state, { payload: { taskId } }) => ({
    ...state,
    result: state.result.filter(id => id !== taskId),
  }),
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
    ...tasksSortedByScore.slice(0, tasksSortedByScoreToPick),
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
  return sortBy(tasks, 'completed');
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
