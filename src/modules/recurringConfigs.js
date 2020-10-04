/**
 * Namespace to keep information of the current session, like user details.
 */

// import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { RESET } from './reset';
import { selectUserId } from './session';
import { fetchListRecurringConfigs, fetchCreateRecurringConfig } from '../utils/apiClient';

export const namespace = 'recurringConfigs';

// Action types

const ADD = `${namespace}/ADD`;
const SET_MULTIPLE = `${namespace}/SET_MULTIPLE`;
export const UPDATE = `${namespace}/UPDATE`;
export const DELETE = `${namespace}/DELETE`;

// Reducers

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [ADD]: (state, { payload: { id, recurringConfig } }) => ({
    ...state,
    allIds: [...state.allIds, id],
    byId: { ...state.byId, [id]: recurringConfig },
  }),
  [SET_MULTIPLE]: (state, { payload }) => ({
    ...state,
    allIds: payload.map(([id]) => id),
    byId: payload.reduce(
      (memo, [id, recurringConfig]) => ({
        ...memo,
        [id]: recurringConfig,
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
  }),
});

// Selectors

export const selectRecurringConfig = (state, id) => state[namespace].byId[id];
export const selectRecurringConfigIdByMostRecentTaskId = (state, mostRecentTaskId) =>
  mostRecentTaskId
    ? state[namespace].allIds.find(
        (id) => state[namespace].byId[id].mostRecentTaskId === mostRecentTaskId,
      )
    : undefined;
export const selectRecurringConfigByMostRecentTaskId = (state, taskId) => {
  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, taskId);
  return recurringConfigId ? state[namespace].byId[recurringConfigId] : undefined;
};

// Actions

const addRecurringConfig = (id, recurringConfig) => ({
  type: ADD,
  payload: { id, recurringConfig },
});
export const updateRecurringConfig = (id, updates) => ({ type: UPDATE, payload: { id, updates } });
export const deleteRecurringConfig = (id) => ({ type: DELETE, payload: { id } });

export const createRecurringConfig = (recurringConfig) => async (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  const recurringConfigWithUserId = { ...recurringConfig, userId };
  const newId = await fetchCreateRecurringConfig(recurringConfigWithUserId).then(({ id }) => {
    dispatch(addRecurringConfig(id, recurringConfigWithUserId));
    return id;
  });
  return newId;
};

export const loadRecurringConfigs = () => async (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) {
    throw new Error('[recurringConfigs:loadRecurringConfigs] No userId');
  }
  const results = await fetchListRecurringConfigs(userId);
  dispatch({ type: SET_MULTIPLE, payload: results });
};
