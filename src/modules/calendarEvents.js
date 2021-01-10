import uniq from 'lodash/uniq';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { createSlice } from '@reduxjs/toolkit';

import parseISO from 'date-fns/parseISO';
import isEqual from 'date-fns/isEqual';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import isValid from 'date-fns/isValid';

import debugConsole from '../utils/debugConsole';
import { gapiListCalendarEvents } from '../googleApi';

// Allow dependency cycle because it's just for selectors
// eslint-disable-next-line import/no-cycle
import { selectCalendarProviderCalendarId } from './calendars';

const name = 'calendarEvents';

// Interval that spans between Quatro reloading calendar events currently in the view
const RELOAD_EVENTS_INTERVAL_MS = 5 * 60 * 1000;
// Format for the date key grouping calendar events in the store
const DATE_KEY_FORMAT = 'yyyy-MM-dd';

// Selectors

const selectCalendarEventIds = (state, dateKey) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  return get(state[name].byDate, [dateKeyString, 'allIds'], []);
};
export const selectCalendarEventsNeedLoading = (state, dateKey, currentTimestamp) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  const fetchedAt = get(state[name].byDate, [dateKeyString, 'fetchedAt']);
  return (
    // not fetched
    fetchedAt == null ||
    // stale
    fetchedAt < currentTimestamp - RELOAD_EVENTS_INTERVAL_MS
  );
};

export const selectCalendarEventSummary = (state, id) => get(state[name].byId[id], 'summary');
export const selectCalendarEventDescription = (state, id) =>
  get(state[name].byId[id], 'description');
export const selectCalendarEventHtmlLink = (state, id) => get(state[name].byId[id], 'htmlLink');
export const selectCalendarEventLocation = (state, id) => get(state[name].byId[id], 'location');
export const selectCalendarEventStartDateTime = (state, id) =>
  get(state[name].byId[id], 'start.dateTime');
export const selectCalendarEventStartTimestamp = (state, id) =>
  get(state[name].byId[id], 'start.timestamp');
export const selectCalendarEventEndDateTime = (state, id) =>
  get(state[name].byId[id], 'end.dateTime');
export const selectCalendarEventEndTimestamp = (state, id) =>
  get(state[name].byId[id], 'end.timestamp');
export const selectCalendarEventAllDay = (state, id) => get(state[name].byId[id], 'allDay');
export const selectCalendarEventDeclined = (state, id) => get(state[name].byId[id], 'declined');
export const selectCalendarEventCollisionCount = (state, id) =>
  get(state[name].byId[id], 'collisionCount');
export const selectCalendarEventCollisionOrder = (state, id) =>
  get(state[name].byId[id], 'collisionOrder');
export const selectCalendarEventCalendarId = (state, id) => get(state[name].byId[id], 'calendarId');
export const selectCalendarEventProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');

export const selectSortedCalendarEventIds = (state, dateKey) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  const calendarEventIds = selectCalendarEventIds(state, dateKeyString);
  return (calendarEventIds || []).filter((id) => !selectCalendarEventAllDay(state, id));
};

export const selectAllDayCalendarEventIds = (state, dateKey) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  const calendarEventIds = selectCalendarEventIds(state, dateKeyString);
  return (calendarEventIds || []).filter((id) => selectCalendarEventAllDay(state, id));
};

// Helpers

export const getCollisions = (event, events) => {
  const startTimestamp = event.start.timestamp;
  const endTimestamp = event.end.timestamp;

  const collisionIds = events.reduce((memo, item) => {
    if (item.id === event.id) {
      return memo;
    }

    const thisStartTimestamp = item.start.timestamp;
    const thisEndTimestamp = item.end.timestamp;
    const hasCollision =
      (endTimestamp > thisStartTimestamp && startTimestamp <= thisStartTimestamp) ||
      (startTimestamp > thisStartTimestamp && startTimestamp < thisEndTimestamp);

    return hasCollision ? [...memo, item.id] : memo;
  }, []);

  return collisionIds;
};

const isItemDeclined = (item) => {
  const seltAttendee = (item.attendees || []).find((attendee) => attendee.self);
  return seltAttendee && seltAttendee.responseStatus === 'declined';
};

const isEventAllDay = (startDate, endDate, startOfDayDate, endOfDayDate) => {
  return Boolean(
    isValid(startDate) &&
      isValid(endDate) &&
      (isEqual(startDate, startOfDayDate) || isBefore(startDate, startOfDayDate)) &&
      (isEqual(endDate, endOfDayDate) || isAfter(endDate, endOfDayDate)),
  );
};

// Slice

const initialState = {
  allIds: [],
  byId: {},
  byDate: {},
};

const slice = createSlice({
  name,
  initialState,
  reducers: {
    clearAllEvents: () => initialState,
    setDayEvents: (state, { payload: { events, dateKey } }) => {
      const dayEventsById = events.reduce((memo, item) => ({ ...memo, [item.id]: item }), {});

      // Optimization to avoid doing it on every render:
      // Add number of collisions and horizontal order to show cards
      const allTimedEvents = events.filter((event) => !event.allDay);
      const dayEventsByIdWithCollisions = Object.entries(dayEventsById).reduce(
        (memo, [id, event]) => {
          // @TODO: handle all day collisions
          const collisionIds = getCollisions(event, allTimedEvents);

          const eventWithCollisionCount = {
            ...event,
            collisionCount: collisionIds.length,
            collisionOrder: event.collisionOrder || 0,
          };
          const otherEventsWithCollisionOrderField = collisionIds.reduce(
            (acc, collisionId) => ({
              ...acc,
              [collisionId]: {
                ...(memo[collisionId] || {}),
                collisionOrder:
                  memo[collisionId] && memo[collisionId].collisionOrder
                    ? memo[collisionId].collisionOrder + 1
                    : 1,
              },
            }),
            {},
          );

          return {
            ...memo,
            [id]: eventWithCollisionCount,
            ...otherEventsWithCollisionOrderField,
          };
        },
        {},
      );

      // Optimization to avoid doing it on every render:
      // Sort IDs by start time
      const allIds = uniq(events.map(({ id }) => id));
      const idTimestampPairs = allIds.map((id) => {
        return { id, timestamp: get(dayEventsById, [id, 'start', 'timestamp'], Infinity) };
      });
      const sortedPairs = sortBy(idTimestampPairs, 'timestamp');
      const sortedIds = sortedPairs.map(({ id }) => id);

      return {
        byId: {
          ...state.byId,
          ...dayEventsByIdWithCollisions,
        },
        byDate: {
          ...state.byDate,
          [dateKey]: {
            fetchedAt: Date.now(),
            allIds: sortedIds,
          },
        },
      };
    },
    // @todo: improve this so we're only flagging the calendar that had changes
    //        or even better, pull those changes only
    staleAllEvents: (state) => ({
      ...state,
      byDate: Object.keys(state.byDate).reduce(
        (memo, dateKey) => ({
          ...memo,
          [dateKey]: {
            ...state[dateKey],
            fetchedAt: 0,
          },
        }),
        {},
      ),
    }),
  },
});

export default slice;
export const { clearAllEvents, staleAllEvents } = slice.actions;

// Helpers

export const addTimestamps = (events) =>
  events.map((event) => ({
    ...event,
    start: {
      ...event.start,
      timestamp: parseISO(event.start.dateTime).getTime(),
    },
    end: {
      ...event.end,
      timestamp: parseISO(event.end.dateTime).getTime(),
    },
  }));

// Thunks

/**
 * @param {Array<string>} calendarIds
 * @param {Date} [date]
 * @param {Function} [callback]
 * @returns {Function} - returned function after dispatching is to unsubscribe
 */
export const loadEvents = (calendarIds, date = new Date(), callback = () => {}) => (
  dispatch,
  getState,
) => {
  let unsubscribed = false;
  let finished = false;

  const dateKey = format(date, DATE_KEY_FORMAT);
  const startOfDayDate = startOfDay(date);
  const endOfDayDate = endOfDay(date);

  const state = getState();
  const providerCalendarIds = calendarIds.map((id) => [
    id,
    selectCalendarProviderCalendarId(state, id),
  ]);

  const promises = providerCalendarIds.map(([calendarId, providerCalendarId]) =>
    gapiListCalendarEvents(providerCalendarId, startOfDayDate, endOfDayDate)
      .then((response) => {
        // console.log(response.result.items);
        return response.result.items;
      })
      // Add IDs to returned items here so we can keep track of them
      .then((items) => items.map((item) => ({ ...item, calendarId, providerCalendarId }))),
  );

  Promise.allSettled(promises).then((results) => {
    if (unsubscribed) {
      return;
    }
    finished = true;

    const errorResults = results.filter(({ status }) => status === 'rejected');
    errorResults.forEach(({ reason }) => {
      console.error(reason); // eslint-disable-line no-console
    });

    const successResults = results.filter(({ status }) => status === 'fulfilled');
    const allItems = successResults.reduce((memo, { value }) => [...memo, ...value], []);
    const itemsWithTimestamps = addTimestamps(allItems);

    const events = itemsWithTimestamps.map((item) => ({
      id: item.id,
      calendarId: item.calendarId,
      providerCalendarId: item.providerCalendarId,
      status: item.status,
      htmlLink: item.htmlLink,
      summary: item.summary,
      description: item.description,
      location: item.location,
      start: {
        dateTime: item.start.dateTime,
        timestamp: item.start.timestamp,
        timeZone: item.start.timeZone,
      },
      end: {
        dateTime: item.end.dateTime,
        timestamp: item.end.timestamp,
        timeZone: item.end.timeZone,
      },
      allDay: isEventAllDay(item.start.timestamp, item.end.timestamp, startOfDayDate, endOfDayDate),
      declined: isItemDeclined(item),
    }));

    dispatch(slice.actions.setDayEvents({ events, dateKey }));
    callback();
  });

  return function unsusbscribe() {
    if (!finished) {
      debugConsole.log('Google API', 'unsubscribe ongoing loadAllEvents');
      unsubscribed = true;
    }
  };
};
