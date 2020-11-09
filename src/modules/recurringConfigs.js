/**
 * Namespace to keep information of the current session, like user details.
 */

// import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import debugConsole from '../utils/debugConsole';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
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

const ADD_CHANGES_TO_LOCAL_STATE = `${namespace}/ADD_CHANGES_TO_LOCAL_STATE`;
const RESET_LOCAL_STATE = `${namespace}/RESET_LOCAL_STATE`;

// Reducers

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [RESET_LOCAL_STATE]: () => ({ ...INITIAL_STATE }),
  [ADD_CHANGES_TO_LOCAL_STATE]: (state, { payload: { added, modified, removed } }) =>
    applyGroupedEntityChanges(state, { added, modified, removed }),
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
  const onNext = ({ groupedChangedEntities, hasEntityChanges, hasLocalUnsavedChanges }) => {
    debugConsole.log('listenToRecurringConfigList', {
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
  const unsubscribe = listenListRecurringConfigs(userId, onNext, onError);
  return unsubscribe;
};
