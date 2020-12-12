/**
 * Google Auth and Google Calendar related states.
 */

import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import formatISO from 'date-fns/formatISO';
import createReducer from '../utils/createReducer';
import { selectUserId } from './session';
import { fetchConnectedCalendars } from '../utils/apiClient';

export const NAMESPACE = 'googlecalendar';

// Action types
const SET_GOOGLE_IS_FETCHING = `${NAMESPACE}/SET_GOOGLE_IS_FETCHING`;
const SET_GOOGLE_API_CLIENT = `${NAMESPACE}/SET_GOOGLE_API_CLIENT`;
const SET_GOOGLE_SIGN_IN_STATUS = `${NAMESPACE}/SET_GOOGLE_SIGN_IN_STATUS`;
const SET_GOOGLE_CALENDARS = `${NAMESPACE}/SET_GOOGLE_CALENDARS`;
const SET_GOOGLE_CONNECTED_CALENDARS = `${NAMESPACE}/SET_GOOGLE_CONNECTED_CALENDARS`;
const SET_GOOGLE_CALENDAR_EVENTS = `${NAMESPACE}/SET_GOOGLE_CALENDAR_EVENTS`;

const INITIAL_STATE = {
  googleIsFetching: true,
  googleAPIClient: null,
  googleSignInStatus: false,
  googleCalendars: [],
  googleConnectedCalendars: [],
  googleCalendarEvents: [],
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_GOOGLE_IS_FETCHING]: (state, { payload }) => ({ ...state, googleIsFetching: payload }),
  [SET_GOOGLE_API_CLIENT]: (state, { payload }) => ({ ...state, googleAPIClient: payload }),
  [SET_GOOGLE_SIGN_IN_STATUS]: (state, { payload }) => ({ ...state, googleSignInStatus: payload }),
  [SET_GOOGLE_CALENDARS]: (state, { payload }) => ({ ...state, googleCalendars: payload }),
  [SET_GOOGLE_CONNECTED_CALENDARS]: (state, { payload }) => ({
    ...state,
    googleConnectedCalendars: payload,
  }),
  [SET_GOOGLE_CALENDAR_EVENTS]: (state, { payload }) => ({
    ...state,
    googleCalendarEvents: [...state.googleCalendarEvents, payload],
  }),
});

// Selectors

export const selectGoogleIsFetching = (state) => state[NAMESPACE].googleIsFetching;
export const selectGoogleAPIClient = (state) => state[NAMESPACE].googleAPIClient;
export const selectGoogleSignInStatus = (state) => state[NAMESPACE].googleSignInStatus;
export const selectGoogleCalendars = (state) => state[NAMESPACE].googleCalendars;
export const selectGoogleConnectedCalendars = (state) => state[NAMESPACE].googleConnectedCalendars;
export const selectGoogleCalendarEvents = (state) => state[NAMESPACE].googleCalendarEvents;

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

export const setGoogleConnectedCalendars = (data) => ({
  type: SET_GOOGLE_CONNECTED_CALENDARS,
  payload: data,
});

export const setGoogleSignInStatus = (status) => ({
  type: SET_GOOGLE_SIGN_IN_STATUS,
  payload: status,
});

export const setGoogleCalendarEvents = (status) => ({
  type: SET_GOOGLE_CALENDAR_EVENTS,
  payload: status,
});

// General Functions

export const getUserCalendars = () => (dispatch, getState) => {
  const state = getState();
  const googleAPIClient = selectGoogleAPIClient(state);

  if (googleAPIClient.client && googleAPIClient.client.calendar) {
    googleAPIClient.client.calendar.calendarList
      .list({
        maxResults: 250,
        minAccessRole: 'writer',
      })
      .execute((calendarListResponse) => {
        dispatch(setGoogleCalendars(calendarListResponse.items));
      });
  }
};

export const getConnectedUserCalendars = () => async (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);

  if (userId) {
    const connectedCalendars = await fetchConnectedCalendars(userId);
    await dispatch(setGoogleConnectedCalendars(connectedCalendars));
  }
};

export const getEventsFromCalendars = (calendarObject) => (dispatch, getState) => {
  const state = getState();
  const googleAPIClient = selectGoogleAPIClient(state);

  calendarObject.map((cal) => {
    if (googleAPIClient.client && googleAPIClient.client.calendar) {
      googleAPIClient.client.calendar.events
        .list({
          calendarId: cal.calendarId,
          timeMin: formatISO(startOfDay(new Date())),
          timeMax: formatISO(endOfDay(new Date())),
          maxResults: 10,
        })
        .execute((calendarListResponse) => {
          const event = {
            id: cal.calendarId,
            items: calendarListResponse.items,
            color: cal.color,
            name: cal.name,
          };
          dispatch(setGoogleCalendarEvents(event));
        });
    }
    return null;
  });
};
