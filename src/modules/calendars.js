import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { listenToListCalendars } from '../utils/apiClient';
import { applyGroupedEntityChanges } from '../utils/firestoreRealtimeHelpers';
import debugConsole from '../utils/debugConsole';
import { LOG_OUT } from './reset';
import { selectUserId } from './session';

export const NAMESPACE = 'calendars';

const INITIAL = 'initial';
const LOADED = 'loaded';

// Action types

const ADD_CHANGES_TO_LOCAL_STATE = `${NAMESPACE}/ADD_CHANGES_TO_LOCAL_STATE`;
const RESET_LOCAL_STATE = `${NAMESPACE}/RESET_LOCAL_STATE`;

const INITIAL_STATE = {
  status: INITIAL,
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [LOG_OUT]: () => ({ ...INITIAL_STATE }),
  [RESET_LOCAL_STATE]: () => ({ ...INITIAL_STATE }),
  [ADD_CHANGES_TO_LOCAL_STATE]: (state, { payload: { added, modified, removed } }) => ({
    status: LOADED,
    ...applyGroupedEntityChanges(state, { added, modified, removed }),
  }),
});

// Selectors

export const selectCalendarsAreFetching = (state) => state[NAMESPACE].status === INITIAL;
export const selectCalendarIds = (state) => state[NAMESPACE].allIds;
export const selectCalendarName = (state, id) => get(state[NAMESPACE].byId[id], 'name');
export const selectCalendarColor = (state, id) => get(state[NAMESPACE].byId[id], 'color');
export const selectCalendarProvider = (state, id) => get(state[NAMESPACE].byId[id], 'provider');
export const selectCalendarProviderCalendarId = (state, id) =>
  get(state[NAMESPACE].byId[id], 'providerCalendarId');
export const selectCalendarProviderUserId = (state, id) =>
  get(state[NAMESPACE].byId[id], 'providerUserId');
export const selectCalendarProviderUserEmail = (state, id) =>
  get(state[NAMESPACE].byId[id], 'providerUserEmail');

export const selectAllConnectedProviderCalendarIds = (state) =>
  selectCalendarIds(state).map((id) => selectCalendarProviderCalendarId(state, id));

// Actions

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
      dispatch({ type: ADD_CHANGES_TO_LOCAL_STATE, payload: groupedChangedEntities });
      initial = false;
    }
    nextCallback(hasLocalUnsavedChanges);
  };
  const onError = (error) => {
    errorCallback(error);
  };
  dispatch({ type: RESET_LOCAL_STATE });
  const unsubscribe = listenToListCalendars(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToCalendarsList', 'unsubscribe');
    unsubscribe();
  };
};
