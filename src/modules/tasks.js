import sortBy from 'lodash/sortBy';
import createReducer from '../util/createReducer';
import {
  createTask,
} from './apiClient';

export const NAMESPACE = 'tasks';

// Action types

const SET_TASKS = 'SET_TASKS';
const ADD_TASK = 'ADD_TASK';
const DELETE_TASK = 'DELETE_TASK';
const UPDATE_TASK = 'UPDATE_TASK';

// Actions

const calculateScore = (impact, effort) => impact * impact * effort;

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

export const setTasks = (tasks) => {
  const tasksWithScore = tasks.map(task => ({
    ...task,
    score: calculateScore(task.impact, task.effort),
  }));
  const normalizedTasks = simpleNormalize(tasksWithScore);
  return {
    type: SET_TASKS,
    payload: { tasks: normalizedTasks },
  };
};

export const updateTask = (taskId, updates) => ({
  type: UPDATE_TASK,
  payload: { taskId, updates },
});
export const deleteTask = taskId => ({
  type: DELETE_TASK,
  payload: { taskId },
});

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
    score: calculateScore(impact, effort),
  };
  const tempId = `${Math.round(Math.random() * 100000)}`;

  dispatch({
    type: ADD_TASK,
    payload: {
      task: {
        ...task,
        id: tempId,
      },
    },
  });

  createTask(task)
    .then(({ id }) => {
      dispatch(deleteTask(tempId));
      dispatch({
        type: ADD_TASK,
        payload: {
          task: {
            ...task,
            id,
          },
        },
      });
    })
    .catch((error) => {
      console.error(error);
    });
};


export const completeTask = taskId => updateTask(taskId, { completed: Date.now() });

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
      [taskId]: { ...state.entities[taskId], ...updates },
    },
  }),
  [SET_TASKS]: (state, action) => ({
    ...state,
    loading: false,
    loaded: true,
    result: [...action.payload.tasks.result],
    entities: { ...action.payload.tasks.entities },
  }),
  [ADD_TASK]: (state, action) => ({
    ...state,
    result: [...state.result, action.payload.task.id],
    entities: {
      ...state.entities,
      [action.payload.task.id]: action.payload.task,
    },
  }),
  [DELETE_TASK]: (state, { payload: { taskId } }) => ({
    ...state,
    result: state.result.filter(id => id !== taskId),
  }),
});

// Selectors

const BACKLOG_SCORE_THRESHOLD = 50;

const getNonCompletedTasks = state => (
  state[NAMESPACE].result
    .map(id => state[NAMESPACE].entities[id])
    .filter(task => task.completed === null)
);

export const getLoading = state => state[NAMESPACE].loading;
export const getLoaded = state => state[NAMESPACE].loaded;
export const getTask = (state, id) => state[NAMESPACE].entities[id];
export const getImportantTasks = (state) => {
  const tasks = getNonCompletedTasks(state)
    .filter(task => task.score >= BACKLOG_SCORE_THRESHOLD);
  return sortBy(tasks, 'score').reverse();
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
    .filter(task => task.scheduledStart !== null);
  return sortBy(tasks, 'scheduledStart');
};
export const getCompletedTasks = (state) => {
  const tasks = state[NAMESPACE].result
    .map(id => state[NAMESPACE].entities[id])
    .filter(task => task.completed !== null);
  return sortBy(tasks, 'completed');
};
export const getBlockingTasks = (state, blockedTaskId) => {
  const task = getTask(state, blockedTaskId);
  const blockingTasks = task.blockers.map(id => getTask(state, id));
  return sortBy(blockingTasks, 'score').reverse();
};
