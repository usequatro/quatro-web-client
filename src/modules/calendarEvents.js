import uniq from 'lodash/uniq';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

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
export const selectCalendarEventTaskId = (state, id) => get(state[name].byId[id], 'taskId');
export const selectCalendarEventSynching = (state, id) => get(state[name].byId[id], 'synching');

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

const ALL_DAY_DATE_REGEXP = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/; // all day date yyyy-MM-dd
const isEventAllDay = (start, end, startOfDayDate, endOfDayDate) => {
  const isAllDay = ALL_DAY_DATE_REGEXP.test(start.date) && ALL_DAY_DATE_REGEXP.test(end.date);
  const isEventLastingMoreThanToday = Boolean(
    isValid(start.timestamp) &&
      isValid(end.timestamp) &&
      (isEqual(start.timestamp, startOfDayDate) || isBefore(start.timestamp, startOfDayDate)) &&
      (isEqual(end.timestamp, endOfDayDate) || isAfter(end.timestamp, endOfDayDate)),
  );
  return isAllDay || isEventLastingMoreThanToday;
};

function sortIdsByStartTimestamp(state, dateKey) {
  const dateEventIds = get(state.byDate, [dateKey, 'allIds'], []);

  const idTimestampPairs = dateEventIds.map((id) => {
    return {
      id,
      timestamp: get(state.byId, [id, 'start', 'timestamp'], Infinity),
    };
  });
  const sortedPairs = sortBy(idTimestampPairs, 'timestamp');
  const sortedIds = sortedPairs.map(({ id }) => id);

  return {
    ...state,
    byDate: {
      ...state.byDate,
      [dateKey]: {
        ...state.byDate[dateKey],
        allIds: sortedIds,
      },
    },
  };
}

function addCollisionsToCalendarEvents(state, dateKey) {
  const dateEventIds = get(state.byDate, [dateKey, 'allIds'], []);
  const dateEvents = dateEventIds.map((id) => state.byId[id]);

  const timedEvents = dateEvents.filter((event) => !event.allDay);
  const dateEventsReset = dateEvents.map((event) => ({
    ...event,
    collisionCount: 0,
    collisionOrder: 0,
  }));
  const dateEventsWithCollisionsById = dateEventsReset.reduce((memo, event) => {
    // @TODO: handle all day collisions
    const collisionIds = getCollisions(event, timedEvents);
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
      [event.id]: eventWithCollisionCount,
      ...otherEventsWithCollisionOrderField,
    };
  }, {});

  return {
    ...state,
    byId: {
      ...state.byId,
      ...dateEventsWithCollisionsById,
    },
  };
}

// Slice

const initialState = {
  allIds: [],
  byId: {},
  byDate: {},
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    clearAllEvents: () => initialState,
    setDayEvents: (state, { payload: { events, dateKey } }) => {
      // Add to state
      const stateWithNewEvents = {
        byId: {
          ...state.byId,
          ...events.reduce((memo, event) => ({ ...memo, [event.id]: event }), {}),
        },
        byDate: {
          ...state.byDate,
          [dateKey]: {
            fetchedAt: Date.now(),
            allIds: uniq(events.map((event) => event.id)),
          },
        },
      };

      const stateWithCollisions = addCollisionsToCalendarEvents(stateWithNewEvents, dateKey);
      const stateWithNewEventsSorted = sortIdsByStartTimestamp(stateWithCollisions, dateKey);

      // Remove calendarEvents that were temporary, synching, when the persisted cal event exists
      const eventTaskIds = events
        .filter((event) => !event.synching && event.taskId)
        .map((event) => event.taskId);
      const idsToRemove = stateWithNewEventsSorted.byDate[dateKey].allIds.filter((id) => {
        const event = stateWithNewEventsSorted.byId[id];
        return event.synching && eventTaskIds.includes(event.taskId);
      });
      const dateKeyAllIds = stateWithNewEventsSorted.byDate[dateKey].allIds.filter(
        (id) => !idsToRemove.includes(id),
      );
      const byId = omit(stateWithNewEventsSorted.byId, idsToRemove);

      // Update state
      state.byId = byId;
      state.byDate[dateKey] = {
        ...(stateWithNewEventsSorted.byDate[dateKey] || {}),
        fetchedAt: Date.now(),
        allIds: dateKeyAllIds,
      };
    },

    addSynchingCalendarEvent: (state, { payload: event }) => {
      const id = `_${uuidv4()}`;
      const dateKey = format(event.start.timestamp, DATE_KEY_FORMAT);

      // Add to state
      const stateWithNewEvents = {
        byId: {
          ...state.byId,
          [id]: { ...event, id, synching: true },
        },
        byDate: {
          ...state.byDate,
          [dateKey]: {
            ...(state.byDate[dateKey] || {}),
            allIds: uniq(get(state.byDate, [dateKey, 'allIds'], []).concat(id)),
          },
        },
      };

      const stateWithCollisions = addCollisionsToCalendarEvents(stateWithNewEvents, dateKey);
      const stateWithNewEventsSorted = sortIdsByStartTimestamp(stateWithCollisions, dateKey);

      return stateWithNewEventsSorted;
    },

    // @todo: improve this so we're only flagging the calendar that had changes
    //        or even better, pull those changes only
    staleAllEvents: (state) => ({
      ...state,
      byDate: Object.keys(state.byDate).reduce(
        (memo, dateKey) => ({
          ...memo,
          [dateKey]: {
            ...state.byDate[dateKey],
            fetchedAt: 0,
          },
        }),
        {},
      ),
    }),
  },
});
/* eslint-enable no-param-reassign */

export default slice;
export const { clearAllEvents, staleAllEvents, addSynchingCalendarEvent } = slice.actions;

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
      allDay: isEventAllDay(item.start, item.end, startOfDayDate, endOfDayDate),
      declined: isItemDeclined(item),
      taskId: get(item, 'extendedProperties.private.taskId', null),
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
