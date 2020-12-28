import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';

import { listenToListCalendars } from '../utils/apiClient';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import debugConsole from '../utils/debugConsole';
import { selectUserId } from './session';

const name = 'calendars';

const INITIAL = 'initial';
const LOADED = 'loaded';

// Selectors

export const selectCalendarsAreFetching = (state) => state[name].status === INITIAL;
export const selectCalendarIds = (state) => state[name].allIds;
export const selectCalendarName = (state, id) => get(state[name].byId[id], 'name');
export const selectCalendarColor = (state, id) => get(state[name].byId[id], 'color');
export const selectCalendarProvider = (state, id) => get(state[name].byId[id], 'provider');
export const selectCalendarProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');
export const selectCalendarProviderUserId = (state, id) =>
  get(state[name].byId[id], 'providerUserId');
export const selectCalendarProviderUserEmail = (state, id) =>
  get(state[name].byId[id], 'providerUserEmail');

export const selectAllConnectedProviderCalendarIds = (state) =>
  selectCalendarIds(state).map((id) => selectCalendarProviderCalendarId(state, id));

// Slice

const initialState = {
  status: INITIAL,
  allIds: [],
  byId: {},
};

const slice = createSlice({
  name,
  initialState,
  reducers: {
    resetLocalState: () => initialState,
    addChangesToLocalState: (state, { payload: { added, modified, removed } }) => ({
      status: LOADED,
      ...applyGroupedEntityChanges(state, { added, modified, removed }),
    }),
  },
});

export default slice;

// Thunks

export const listenToCalendarsList = (nextCallback = () => {}, errorCallback = () => {}) => (
  dispatch,
  getState,
) => {
  const state = getState();
  const userId = selectUserId(state);

  let initial = true;

  const onNext = ({ groupedChangedEntities, hasEntityChanges, hasLocalUnsavedChanges }) => {
    debugConsole.log('Firestore', 'listenToCalendarsList', {
      groupedChangedEntities,
      hasEntityChanges,
      hasLocalUnsavedChanges,
    });
    if (hasEntityChanges || initial) {
      dispatch(slice.actions.addChangesToLocalState(groupedChangedEntities));
      initial = false;
    }
    nextCallback(hasLocalUnsavedChanges);
  };
  const onError = (error) => {
    errorCallback(error);
  };
  dispatch(slice.actions.resetLocalState());
  const unsubscribe = listenToListCalendars(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToCalendarsList', 'unsubscribe');
    unsubscribe();
  };
};
