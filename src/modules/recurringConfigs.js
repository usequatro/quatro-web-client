/**
 * Namespace to keep information of the current session, like user details.
 */

// import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { RESET } from './reset';
import { selectUserId } from './session';
import {
  fetchCreateRecurringConfig,
  listenListRecurringConfigs,
  fetchDeleteRecurringConfig,
  fetchUpdateRecurringConfig,
} from '../utils/apiClient';

export const namespace = 'recurringConfigs';

// Action types

const ADD_TO_LOCAL_STATE = `${namespace}/ADD_TO_LOCAL_STATE`;
const UPDATE_LOCAL_STATE = `${namespace}/UPDATE_LOCAL_STATE`;
const REMOVE_FROM_LOCAL_STATE = `${namespace}/REMOVE_FROM_LOCAL_STATE`;
const RESET_LOCAL_STATE = `${namespace}/RESET_LOCAL_STATE`;

// Reducers

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [RESET_LOCAL_STATE]: () => ({ ...INITIAL_STATE }),
  [ADD_TO_LOCAL_STATE]: (state, { payload: { id, recurringConfig } }) => {
    if (state.byId[id]) {
      throw new Error(
        `Reducer validation failed, trying to add recurring config id ${id} but already exists.`,
      );
    }
    return {
      ...state,
      allIds: [...state.allIds, id],
      byId: { ...state.byId, [id]: recurringConfig },
    };
  },
  [UPDATE_LOCAL_STATE]: (state, { payload: { id, updates } }) => ({
    ...state,
    byId: { ...state.byId, [id]: { ...state.byId[id], ...updates } },
  }),
  [REMOVE_FROM_LOCAL_STATE]: (state, { payload: { id } }) => ({
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

export const updateRecurringConfig = (id, updates) => () => fetchUpdateRecurringConfig(id, updates);
export const deleteRecurringConfig = (id) => () => fetchDeleteRecurringConfig(id);

export const createRecurringConfig = (recurringConfig) => async (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  const recurringConfigWithUserId = { ...recurringConfig, userId };
  const newId = await fetchCreateRecurringConfig(recurringConfigWithUserId).then(({ id }) => {
    return id;
  });
  return newId;
};

export const listenToRecurringConfigList = (userId, nextCallback, errorCallback) => (dispatch) => {
  const onNext = (results, hasUnsavedChanges) => {
    console.log('listenToRecurringConfigList', results, hasUnsavedChanges); // eslint-disable-line no-console
    results.forEach(({ type, entity: [id, data] }) => {
      if (type === 'removed') {
        dispatch({ type: REMOVE_FROM_LOCAL_STATE, payload: { id } });
      }
      if (type === 'added') {
        dispatch({ type: ADD_TO_LOCAL_STATE, payload: { id, recurringConfig: data } });
      }
      if (type === 'modified') {
        dispatch({ type: UPDATE_LOCAL_STATE, payload: { id, updates: data } });
      }
    });
    nextCallback(hasUnsavedChanges);
  };
  const onError = (error) => {
    errorCallback(error);
  };
  dispatch({ type: RESET_LOCAL_STATE });
  const unsubscribe = listenListRecurringConfigs(userId, onNext, onError);
  return unsubscribe;
};
