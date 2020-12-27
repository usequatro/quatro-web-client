import uniq from 'lodash/uniq';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { createSlice } from '@reduxjs/toolkit';

import parseISO from 'date-fns/parseISO';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import isEqual from 'date-fns/isEqual';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import isPast from 'date-fns/isPast';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import isValid from 'date-fns/isValid';

import { TICK_HEIGHT, TICKS_PER_HOUR } from '../constants/tickConstants';
import debugConsole from '../utils/debugConsole';
import { selectCalendarProviderCalendarId } from './calendars';
import { LOG_OUT } from './reset';
import { gapiListCalendarEvents } from '../googleApi';

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
export const selectCalendarEventEndDateTime = (state, id) =>
  get(state[name].byId[id], 'end.dateTime');
export const selectCalendarEventAllDay = (state, id) => get(state[name].byId[id], 'allDay');
export const selectCalendarEventCalendarId = (state, id) => get(state[name].byId[id], 'calendarId');
export const selectCalendarEventProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');
export const selectCalendarEventStyle = (state, id) => get(state[name].byId[id], 'style');

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

const minutesForOneTick = 60 / TICKS_PER_HOUR;

const getEventDisplayHeight = (startDate, endDate) => {
  const eventDurationInMinutes = differenceInMinutes(endDate, startDate);
  const eventDurationInTicks = eventDurationInMinutes / minutesForOneTick;
  return Math.floor(TICK_HEIGHT * eventDurationInTicks);
};
const getEventDisplayTop = (startDate) => {
  const eventStartInMinutes = differenceInMinutes(startDate, startOfDay(startDate));
  const eventStartInTicks = eventStartInMinutes / minutesForOneTick;
  return Math.floor(eventStartInTicks * TICK_HEIGHT);
};

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

const PAST_EVENT_OPACITY = 0.7;

const getEventCardStyle = (event) => {
  if (event.allDay) {
    return {};
  }

  const height = getEventDisplayHeight(event.start.timestamp, event.end.timestamp);

  const width = Math.floor(100 / (1 + (event.collisionCount || 0)));
  const left = (event.collisionOrder || 0) * width;

  return {
    height,
    transform: `translateY(${getEventDisplayTop(event.start.timestamp)}px)`,
    left: `${left}%`,
    width: `${width}%`,
    opacity: isPast(event.end.timestamp) ? PAST_EVENT_OPACITY : 1,
    position: 'absolute',
    zIndex: 1,
  };
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
  extraReducers: {
    [LOG_OUT]: () => initialState,
  },
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
      // Add style to events depending on their properties
      const dayEventsByIdWithStyle = Object.entries(dayEventsByIdWithCollisions).reduce(
        (memo, [id, event]) => {
          const eventWithStyle = {
            ...event,
            style: getEventCardStyle(event),
          };

          return {
            ...memo,
            [id]: eventWithStyle,
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
          ...dayEventsByIdWithStyle,
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
  },
});

export default slice;
export const { clearAllEvents } = slice.actions;

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

  debugConsole.log('Google API', 'fetching events for', dateKey, calendarIds);

  const promises = providerCalendarIds.map(([calendarId, providerCalendarId]) =>
    gapiListCalendarEvents(providerCalendarId, startOfDayDate, endOfDayDate)
      .then((response) => response.result.items)
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
    const items = successResults.reduce((memo, { value }) => [...memo, ...value], []);

    // console.log(items);

    const itemsWithTimestamps = addTimestamps(items);

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
