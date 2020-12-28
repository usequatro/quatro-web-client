import { createSlice } from '@reduxjs/toolkit';

import debugConsole from '../utils/debugConsole';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import { selectUserId } from './session';
import {
  fetchCreateRecurringConfig,
  listenListRecurringConfigs,
  fetchDeleteRecurringConfig,
  fetchUpdateRecurringConfig,
} from '../utils/apiClient';

const name = 'recurringConfigs';

// Selectors

export const selectRecurringConfig = (state, id) => state[name].byId[id];
export const selectRecurringConfigIdByMostRecentTaskId = (state, mostRecentTaskId) =>
  mostRecentTaskId
    ? state[name].allIds.find((id) => state[name].byId[id].mostRecentTaskId === mostRecentTaskId)
    : undefined;
export const selectRecurringConfigByMostRecentTaskId = (state, taskId) => {
  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, taskId);
  return recurringConfigId ? state[name].byId[recurringConfigId] : undefined;
};

// Slice

const initialState = {
  allIds: [],
  byId: {},
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    resetLocalState: () => initialState,
    addChangesToLocalState: (state, { payload: { added, modified, removed } }) =>
      applyGroupedEntityChanges(state, { added, modified, removed }),
  },
});
/* eslint-enable no-param-reassign */

export default slice;

// Thunks

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
    debugConsole.log('Firestore', 'listenToRecurringConfigList', {
      groupedChangedEntities,
      hasEntityChanges,
      hasLocalUnsavedChanges,
    });
    if (hasEntityChanges) {
      dispatch(slice.actions.addChangesToLocalState(groupedChangedEntities));
    }
    nextCallback(hasLocalUnsavedChanges);
  };
  const onError = (error) => {
    errorCallback(error);
  };
  dispatch(slice.actions.resetLocalState());
  const unsubscribe = listenListRecurringConfigs(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToRecurringConfigList', 'unsubscribe');
    unsubscribe();
  };
};
