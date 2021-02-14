import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';

import { listenToListCalendars } from '../utils/apiClient';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import debugConsole from '../utils/debugConsole';
import { selectUserId } from './session';

// Allow dependency cycle because it's just for selectors
// eslint-disable-next-line import/no-cycle
import { staleAllEvents } from './calendarEvents';

const name = 'calendars';

const INITIAL = 'initial';
const LOADED = 'loaded';

// Selectors

export const selectCalendarsAreFetching = (state) => state[name].status === INITIAL;
export const selectCalendarsAreLoaded = (state) => state[name].status === LOADED;
export const selectCalendarIds = (state) => state[name].allIds;
export const selectCalendarCount = (state) => state[name].allIds.length;
export const selectCalendarName = (state, id) => get(state[name].byId[id], 'name');
export const selectCalendarColor = (state, id) => get(state[name].byId[id], 'color');
const selectCalendarWatcherLastUpdated = (state, id) =>
  get(state[name].byId[id], 'watcherLastUpdated');
export const selectCalendarProvider = (state, id) => get(state[name].byId[id], 'provider');
export const selectCalendarProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');
export const selectCalendarProviderUserId = (state, id) =>
  get(state[name].byId[id], 'providerUserId');
export const selectCalendarProviderUserEmail = (state, id) =>
  get(state[name].byId[id], 'providerUserEmail');
export const selectSystemNoficationsEnabled = (state, id) =>
  get(state[name].byId[id], 'systemNotifications.enabled');
export const selectSystemNoficationsMinutesInAdvance = (state, id) =>
  get(state[name].byId[id], 'systemNotifications.minutesInAdvance', 5);

export const selectAllConnectedProviderCalendarIds = (state) =>
  selectCalendarIds(state).map((id) => selectCalendarProviderCalendarId(state, id));

/** @returns {string|undefined} */
export const selectFallbackCalendarId = (state) => {
  if (state[name].allIds.length === 0) {
    return undefined;
  }
  return state[name].allIds[0];
};

/** @returns {Array<string>} */
export const selectCalendarIdsWithSystemNotificationsEnabled = (state) => {
  const allIds = selectCalendarIds(state);
  const enabledIds = allIds.filter((id) => selectSystemNoficationsEnabled(state, id));
  return enabledIds;
};

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

/**
 * Check if the calendar received updates via webhook
 * @param {Object} previousState
 * @param {Object} newState
 * @returns {boolean}
 */
const hasWatcherUpdates = (previousState, newState) => {
  const calendarIds = selectCalendarIds(previousState);
  // eslint-disable-next-line no-restricted-syntax
  for (const calendarId of calendarIds) {
    const previousWatcherLastUpdated = selectCalendarWatcherLastUpdated(previousState, calendarId);
    const newWatcherLastUpdated = selectCalendarWatcherLastUpdated(newState, calendarId);
    if (newWatcherLastUpdated && newWatcherLastUpdated > previousWatcherLastUpdated) {
      return true;
    }
  }
  return false;
};

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
      const previousState = getState();
      dispatch(slice.actions.addChangesToLocalState(groupedChangedEntities));

      // If the calendar received updates via webhook, we flag its events as stale
      if (hasWatcherUpdates(previousState, getState())) {
        debugConsole.log('Firestore', 'listenToCalendarsList', 'calendar watcher update datected');
        dispatch(staleAllEvents());
      }
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
