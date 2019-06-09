import sortBy from 'lodash/sortBy';
import createReducer from '../util/createReducer';

export const NAMESPACE = 'tasks';

// Action types

const SET_TASKS = 'SET_TASKS';
const ADD_TASK = 'ADD_TASK';

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

export const addTask = ({
  title = isRequired(),
  effort = isRequired(),
  impact = isRequired(),
  start = isRequired(),
}) => {
  const task = {
    title,
    effort,
    impact,
    start,
    completed: false,
    blockers: [],
    score: calculateScore(impact, effort),
  };
  return {
    type: ADD_TASK,
    payload: { task },
  };
};

// Reducers

const INITIAL_STATE = {
  result: [],
  entities: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_TASKS]: (state, action) => ({
    ...action.payload.tasks,
  }),
  [ADD_TASK]: (state, action) => ({
    result: [...state.result, action.payload.task.id],
    entities: {
      ...state.entities,
      [action.payload.task.id]: action.payload.task,
    },
  }),
});

// Selectors

const BACKLOG_SCORE_THRESHOLD = 50;

const getNonCompletedTasks = state => (
  state[NAMESPACE].result
    .map(id => state[NAMESPACE].entities[id])
    .filter(task => task.completed === null)
);

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
    .filter(task => task.start !== null);
  return sortBy(tasks, 'start');
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
