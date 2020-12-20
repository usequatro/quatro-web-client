import uniq from 'lodash/uniq';
import get from 'lodash/get';

import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import formatISO from 'date-fns/formatISO';

import createReducer from '../utils/createReducer';
import { selectCalendarProviderCalendarId } from './calendars';
import { RESET } from './reset';

export const NAMESPACE = 'calendarEvents';

// Action types

const ADD_EVENTS = `${NAMESPACE}/ADD_EVENTS`;
const CLEAR_EVENTS = `${NAMESPACE}/CLEAR_EVENTS`;

const INITIAL_STATE = {
  allIds: [],
  byId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [CLEAR_EVENTS]: () => ({ ...INITIAL_STATE }),
  [ADD_EVENTS]: (state, { payload }) => ({
    allIds: uniq([...state.allIds, ...payload.map(({ id }) => id)]),
    byId: {
      ...state.byId,
      ...payload.reduce((memo, item) => ({ ...memo, [item.id]: item }), {}),
    },
  }),
});

// Selectors

export const selectCalendarEventIds = (state) => state[NAMESPACE].allIds;
export const selectCalendarEventSummary = (state, id) => get(state[NAMESPACE].byId[id], 'summary');
export const selectCalendarEventStartDateTime = (state, id) =>
  get(state[NAMESPACE].byId[id], 'start.dateTime');
export const selectCalendarEventEndDateTime = (state, id) =>
  get(state[NAMESPACE].byId[id], 'end.dateTime');
export const selectCalendarEventCalendarId = (state, id) =>
  get(state[NAMESPACE].byId[id], 'calendarId');

// Actions

export const loadEventsForCalendar = (calendarId, date) => (dispatch, getState) => {
  const state = getState();
  const providerCalendarId = selectCalendarProviderCalendarId(state, calendarId);

  window.gapi.client.calendar.events
    // @see https://developers.google.com/calendar/v3/reference/events/list
    .list({
      calendarId: providerCalendarId,
      timeMin: formatISO(startOfDay(date)),
      timeMax: formatISO(endOfDay(date)),
      maxResults: 25,
      singleEvents: true,
    })
    .execute((calendarListResponse) => {
      // To see all data, uncomment below
      // console.log(calendarListResponse.items); // eslint-disable-line
      dispatch({
        type: ADD_EVENTS,
        payload: (calendarListResponse.items || [])
          .filter((item) => item.status !== 'canceled')
          .map((item) => ({
            id: item.id,
            calendarId,
            providerCalendarId,
            status: item.status,
            htmlLink: item.htmlLink,
            summary: item.summary,
            description: item.description,
            location: item.location,
            start: item.start,
            end: item.end,
          })),
      });
    });
};

export const loadAllEvents = (calendarIds, date = new Date()) => (dispatch) => {
  calendarIds.forEach((calendarId) => {
    dispatch(loadEventsForCalendar(calendarId, date));
  });
};

export const clearEvents = () => ({ type: CLEAR_EVENTS });
