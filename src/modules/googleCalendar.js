/**
 * Google Auth and Google Calendar related states.
 */

import createReducer from '../utils/createReducer';

export const NAMESPACE = 'googlecalendar';


// Action types
const SET_GOOGLE_IS_FETCHING = `${NAMESPACE}/SET_GOOGLE_IS_FETCHING`;
const SET_GOOGLE_API_CLIENT = `${NAMESPACE}/SET_GOOGLE_API_CLIENT`;
const SET_GOOGLE_SIGN_IN_STATUS = `${NAMESPACE}/SET_GOOGLE_SIGN_IN_STATUS`;
const SET_GOOGLE_CALENDARS = `${NAMESPACE}/SET_GOOGLE_CALENDARS`;

const INITIAL_STATE = {
  googleIsFetching: true,
  googleAPIClient: null,
  googleSignInStatus: false,
  googleCalendars: [],
  connectedGoogleCalendars: []
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_GOOGLE_IS_FETCHING]: (state, { payload }) => ({ ...state, googleIsFetching: payload }),
  [SET_GOOGLE_API_CLIENT]: (state, { payload }) => ({ ...state, googleAPIClient: payload }),
  [SET_GOOGLE_SIGN_IN_STATUS]: (state, { payload }) => ({ ...state, googleSignInStatus: payload }),
  [SET_GOOGLE_CALENDARS]: (state, { payload }) => ({ ...state, googleCalendars: payload }),
});

// Selectors

export const selectGoogleIsFetching = (state) => state[NAMESPACE].googleIsFetching;
export const selectGoogleAPIClient = (state) => state[NAMESPACE].googleAPIClient;
export const selectGoogleSignInStatus = (state) => state[NAMESPACE].googleSignInStatus;
export const selectGoogleCalendars = (state) => state[NAMESPACE].googleCalendars;
export const selectConnectedGoogleCalendars = (state) => state[NAMESPACE].connectedGoogleCalendars;

export const setGoogleAPIClient = (client) => ({
  type: SET_GOOGLE_API_CLIENT,
  payload: client,
});

export const setGoogleIsFetching = (status) => ({
  type: SET_GOOGLE_IS_FETCHING,
  payload: status,
});

export const setGoogleCalendars = (data) => ({
  type: SET_GOOGLE_CALENDARS,
  payload: data,
});

// Actions

export const setGoogleSignInStatus = (status) => ({
  type: SET_GOOGLE_SIGN_IN_STATUS,
  payload: status,
});


// General Functions

export const getUserCalendars = () => (dispatch, getState) => {
  const state = getState();
  const googleAPIClient = selectGoogleAPIClient(state);

  googleAPIClient.client.calendar.calendarList.list({
    maxResults: 250,
    minAccessRole: 'writer',
  }).execute(calendarListResponse => {
    dispatch(setGoogleCalendars(calendarListResponse.items));
  });
};
