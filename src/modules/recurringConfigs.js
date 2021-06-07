import { createSlice } from '@reduxjs/toolkit';
import get from 'lodash/get';

import debugConsole from '../utils/debugConsole';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import { selectUserId } from './session';
import {
  fetchCreateRecurringConfigWithId,
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

// @todo: remopve this selector. mostRecentTaskId will be deprecated
export const selectRecurringConfigByMostRecentTaskId = (state, taskId) => {
  const recurringConfigId = selectRecurringConfigIdByMostRecentTaskId(state, taskId);
  return recurringConfigId ? state[name].byId[recurringConfigId] : undefined;
};

export const selectRecurringConfigUnit = (state, id) =>
  get(selectRecurringConfig(state, id), 'unit');
export const selectRecurringConfigAmount = (state, id) =>
  get(selectRecurringConfig(state, id), 'amount');
export const selectRecurringConfigActiveWeekdays = (state, id) =>
  get(selectRecurringConfig(state, id), 'activeWeekdays');

export const selectRecurringConfigTaskTitle = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.title');
export const selectRecurringConfigTaskDescription = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.description');
export const selectRecurringConfigTaskImpact = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.impact');
export const selectRecurringConfigTaskEffort = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.effort');
export const selectRecurringConfigTaskScheduledTime = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.scheduledTime');
export const selectRecurringConfigTaskDueTime = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.dueTime');
export const selectRecurringConfigTaskDueOffsetDays = (state, id) =>
  get(selectRecurringConfig(state, id), 'taskDetails.dueOffsetDays');
// export const selectRecurringConfigReferenceDate = (state, id) =>
//   get(selectRecurringConfig(state, id), 'referenceDate');

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

export const createRecurringConfigWithId = (recurringConfig, newId) => async (_, getState) => {
  const state = getState();
  const userId = selectUserId(state);
  const recurringConfigWithUserId = { ...recurringConfig, userId };
  return fetchCreateRecurringConfigWithId(recurringConfigWithUserId, newId);
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
