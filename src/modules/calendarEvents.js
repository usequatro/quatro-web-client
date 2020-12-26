import uniq from 'lodash/uniq';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

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
import createReducer from '../utils/createReducer';
import debugConsole from '../utils/debugConsole';
import { selectCalendarProviderCalendarId } from './calendars';
import { LOG_OUT } from './reset';
import { gapiListCalendarEvents } from '../googleApi';

export const NAMESPACE = 'calendarEvents';

// Interval that spans between Quatro reloading calendar events currently in the view
const RELOAD_EVENTS_INTERVAL_MS = 5 * 60 * 1000;

export const DATE_KEY_FORMAT = 'yyyy-MM-dd';

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

// Action types

const ADD_EVENTS = `${NAMESPACE}/ADD_EVENTS`;
const CLEAR_ALL_EVENTS = `${NAMESPACE}/CLEAR_ALL_EVENTS`;

const INITIAL_STATE = {
  allIds: [],
  byId: {},
  byDate: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [LOG_OUT]: () => ({ ...INITIAL_STATE }),
  [CLEAR_ALL_EVENTS]: () => ({ ...INITIAL_STATE }),
  [ADD_EVENTS]: (state, { payload: { events, dateKey } }) => {
    const byId = {
      ...state.byId,
      ...events.reduce((memo, item) => ({ ...memo, [item.id]: item }), {}),
    };

    // Optimization to avoid doing it on every render:
    // Add number of collisions and horizontal order to show cards
    const allTimedEvents = Object.values(byId).filter((event) => !event.allDay);
    const byIdWithCollisions = Object.entries(byId).reduce((memo, [id, event]) => {
      const collisionIds = getCollisions(event, allTimedEvents);

      const eventWithCollisionCount = {
        ...event,
        collisionCount: collisionIds.length,
        collisionOrder: event.collisionOrder || 0,
      };
      const otherEventsWithCollisionPreference = collisionIds.reduce(
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
        ...otherEventsWithCollisionPreference,
      };
    }, {});

    // Optimization to avoid doing it on every render:
    // Add style to events depending on their properties
    const byIdWithStyle = Object.entries(byIdWithCollisions).reduce((memo, [id, event]) => {
      const eventWithStyle = {
        ...event,
        style: getEventCardStyle(event),
      };

      return {
        ...memo,
        [id]: eventWithStyle,
      };
    }, {});

    // Optimization to avoid doing it on every render:
    // Sort IDs by start time
    const allIds = uniq(events.map(({ id }) => id));
    const idTimestampPairs = allIds.map((id) => {
      return { id, timestamp: get(byId, [id, 'start', 'timestamp'], Infinity) };
    });
    const sortedPairs = sortBy(idTimestampPairs, 'timestamp');
    const sortedIds = sortedPairs.map(({ id }) => id);

    return {
      byId: byIdWithStyle,
      byDate: {
        ...state.byDate,
        [dateKey]: {
          fetchedAt: Date.now(),
          allIds: sortedIds,
        },
      },
    };
  },
});

// Selectors

const selectCalendarEventIds = (state, dateKey) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  return get(state[NAMESPACE].byDate, [dateKeyString, 'allIds'], []);
};
export const selectCalendarEventsNeedLoading = (state, dateKey, currentTimestamp) => {
  const dateKeyString = typeof dateKey === 'string' ? dateKey : format(dateKey, DATE_KEY_FORMAT);
  const fetchedAt = get(state[NAMESPACE].byDate, [dateKeyString, 'fetchedAt']);
  return (
    // not fetched
    fetchedAt == null ||
    // stale
    fetchedAt < currentTimestamp - RELOAD_EVENTS_INTERVAL_MS
  );
};

export const selectCalendarEventSummary = (state, id) => get(state[NAMESPACE].byId[id], 'summary');
export const selectCalendarEventDescription = (state, id) =>
  get(state[NAMESPACE].byId[id], 'description');
export const selectCalendarEventHtmlLink = (state, id) =>
  get(state[NAMESPACE].byId[id], 'htmlLink');
export const selectCalendarEventLocation = (state, id) =>
  get(state[NAMESPACE].byId[id], 'location');
export const selectCalendarEventStartDateTime = (state, id) =>
  get(state[NAMESPACE].byId[id], 'start.dateTime');
export const selectCalendarEventEndDateTime = (state, id) =>
  get(state[NAMESPACE].byId[id], 'end.dateTime');
export const selectCalendarEventAllDay = (state, id) => get(state[NAMESPACE].byId[id], 'allDay');
export const selectCalendarEventCalendarId = (state, id) =>
  get(state[NAMESPACE].byId[id], 'calendarId');
export const selectCalendarEventProviderCalendarId = (state, id) =>
  get(state[NAMESPACE].byId[id], 'providerCalendarId');
export const selectCalendarEventStyle = (state, id) => get(state[NAMESPACE].byId[id], 'style');

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

const isEventAllDay = (startDate, endDate, startOfDayDate, endOfDayDate) => {
  return Boolean(
    isValid(startDate) &&
      isValid(endDate) &&
      (isEqual(startDate, startOfDayDate) || isBefore(startDate, startOfDayDate)) &&
      (isEqual(endDate, endOfDayDate) || isAfter(endDate, endOfDayDate)),
  );
};

// Helpers to calculate display properties for the events

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

// Actions

export const fetchEventsForCalendar = (providerCalendarId, startDate, endDate) => {
  return gapiListCalendarEvents(providerCalendarId, startDate, endDate).then(
    (response) => response.result.items,
  );
};

/**
 * @param {Array<string>} calendarIds
 * @param {Date} [date]
 * @param {Function} [callback]
 * @returns {Function} - to unsubscribe
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
    fetchEventsForCalendar(providerCalendarId, startOfDayDate, endOfDayDate)
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

    dispatch({
      type: ADD_EVENTS,
      payload: {
        events,
        dateKey,
      },
    });

    callback();
  });

  return function unsusbscribe() {
    if (!finished) {
      debugConsole.log('Google API', 'unsubscribe ongoing loadAllEvents');
      unsubscribed = true;
    }
  };
};

export const clearAllEvents = () => ({ type: CLEAR_ALL_EVENTS });
