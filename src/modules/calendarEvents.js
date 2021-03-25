import get from 'lodash/get';
import fpSet from 'lodash/fp/set';
import { createSlice } from '@reduxjs/toolkit';
import Joi from '@hapi/joi';

import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';

// import debugConsole from '../utils/debugConsole';
import { gapiListCalendarEvents } from '../googleApi';
import { timestampSchema } from '../utils/validators';
import updateArray from '../utils/updateArray';

// Allow dependency cycle because it's just for selectors
// eslint-disable-next-line import/no-cycle
import { selectCalendarProviderCalendarId, selectCalendarIds } from './calendars';

import { DEFAULT, PUBLIC, PRIVATE, CONFIDENTIAL } from '../constants/eventVisibilities';

const name = 'calendarEvents';

const calendarEventSchema = Joi.object({
  id: Joi.string().required(),
  calendarId: Joi.string().required(),
  providerCalendarId: Joi.string(),
  htmlLink: Joi.string(),
  summary: Joi.string().required(),
  status: Joi.valid('cancelled', 'confirmed', 'tentative'),
  description: Joi.string(),
  location: Joi.string(),
  start: Joi.object({
    dateTime: Joi.string(),
    timestamp: timestampSchema,
    timeZone: Joi.string(),
  }).default({}),
  end: Joi.object({
    dateTime: Joi.string(),
    timestamp: timestampSchema,
    timeZone: Joi.string(),
  }).default({}),
  allDay: Joi.bool(),
  declined: Joi.bool(),
  visibility: Joi.valid(DEFAULT, PUBLIC, PRIVATE, CONFIDENTIAL), // present when user is organizer
  taskId: Joi.string().allow(null),
});

const overlapsTimeRange = (intervals, from, to) =>
  Boolean(intervals.find((interval) => interval[0] <= from && to <= interval[1]));
const overlapsTime = (intervals, value) =>
  Boolean(intervals.find((interval) => interval[0] <= value && value <= interval[1]));

// Selectors

const selectIntervalsRequested = (state, calendarId) =>
  get(state[name].byCalendar, [calendarId, 'intervalsRequested']);
const selectIntervalsFetched = (state, calendarId) =>
  get(state[name].byCalendar, [calendarId, 'intervalsFetched']);

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
/** @returns {string|undefined} */
export const selectCalendarEventVisibility = (state, id) => get(state[name].byId[id], 'visibility');
export const selectCalendarEventDeclined = (state, id) => get(state[name].byId[id], 'declined');
export const selectCalendarEventCollisionCount = (state, id) =>
  get(state[name].byId[id], 'collisionCount');
export const selectCalendarEventCollisionOrder = (state, id) =>
  get(state[name].byId[id], 'collisionOrder');
export const selectCalendarEventCalendarId = (state, id) => get(state[name].byId[id], 'calendarId');
export const selectCalendarEventProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');
export const selectCalendarEventTaskId = (state, id) => get(state[name].byId[id], 'taskId');
export const selectCalendarEventPlaceholderUntilCreated = (state, id) =>
  get(state[name].byId[id], 'placeholderUntilCreated');

export const selectCalendarEventsIntervalIsFetched = (state, calendarId, start, end) => {
  const intervalsFetched = selectIntervalsFetched(state, calendarId);
  return Boolean(intervalsFetched && overlapsTimeRange(intervalsFetched, start, end));
};

const selectCalendarEventsIntervalIsRequested = (state, calendarId, start, end) => {
  const intervalsRequested = selectIntervalsRequested(state, calendarId);
  return Boolean(intervalsRequested && overlapsTimeRange(intervalsRequested, start, end));
};

export const selectCalendarEventsTimeIsFetching = (state, timestamp) => {
  const calendarIds = selectCalendarIds(state);

  const fetching = calendarIds.reduce((memo, calendarId) => {
    if (memo) {
      return memo;
    }
    const intervalsRequested = selectIntervalsRequested(state, calendarId) || [];
    const intervalsFetched = selectIntervalsFetched(state, calendarId) || [];
    return (
      overlapsTime(intervalsRequested, timestamp) && !overlapsTime(intervalsFetched, timestamp)
    );
  }, false);

  return Boolean(fetching);
};

/** @return {Array<string>} */
export const selectCalendarEventIdsForDate = (state, timestamp) => {
  const start = startOfDay(timestamp).getTime();
  const end = endOfDay(timestamp).getTime();
  return state[name].allIds.filter(
    (eventId) =>
      !selectCalendarEventAllDay(state, eventId) &&
      selectCalendarEventStartTimestamp(state, eventId) >= start &&
      selectCalendarEventEndTimestamp(state, eventId) <= end,
  );
};

/** @return {Array<string>} */
export const selectAllDayCalendarEventIds = (state, timestamp) => {
  const start = startOfDay(timestamp).getTime();
  const end = endOfDay(timestamp).getTime();
  return state[name].allIds.filter(
    (eventId) =>
      selectCalendarEventAllDay(state, eventId) &&
      selectCalendarEventStartTimestamp(state, eventId) <= start &&
      selectCalendarEventEndTimestamp(state, eventId) >= end,
  );
};

/** @returns {Array<string>} */
export const selectCalendarEventIdsForNotifications = (state, calendarId, { earliest, latest }) => {
  return state[name].allIds.filter(
    (eventId) =>
      selectCalendarEventCalendarId(state, eventId) === calendarId &&
      !selectCalendarEventAllDay(state, eventId) &&
      !selectCalendarEventDeclined(state, eventId) &&
      !selectCalendarEventPlaceholderUntilCreated(state, eventId) &&
      selectCalendarEventStartTimestamp(state, eventId) >= earliest &&
      selectCalendarEventStartTimestamp(state, eventId) <= latest,
  );
};

// Helpers

export const getCollisions = (event, events) => {
  const startTimestamp = event.start.timestamp;
  const endTimestamp = event.end.timestamp;

  const collisionIds = events.reduce((memo, item) => {
    if (item.id === event.id || item.allDay !== event.allDay) {
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

function sortAllIdsByStartTimestamp(state, calendarId) {
  // Sort allIds by start timestamp. This helps rendering, so the first DOM node is the first
  // event. That way, we can easily scroll to it.
  state.allIds.sort((a, b) => state.byId[a].start.timestamp - state.byId[b].start.timestamp);
  state.byCalendar[calendarId].allIds.sort(
    (a, b) => state.byId[a].start.timestamp - state.byId[b].start.timestamp,
  );
}

function addCollisionsToCalendarEvents(state) {
  const allEvents = Object.values(state.byCalendar).reduce(
    (memo, stateSection) => [...memo, ...(stateSection.allIds || []).map((id) => state.byId[id])],
    [],
  );

  const eventsResetted = allEvents.map((event) => ({
    ...event,
    collisionCount: 0,
    collisionOrder: 0,
  }));
  const eventsWithCollisionsById = eventsResetted.reduce((memo, event) => {
    const collisionIds = getCollisions(event, allEvents);
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
      ...eventsWithCollisionsById,
    },
  };
}

const mergeOverlappingIntervals = (originalIntervals) => {
  const intervals = originalIntervals.map((interval) => [...interval]);

  intervals.sort((a, b) => {
    return a[0] - b[0];
  });

  const stack = [];

  if (intervals.length > 0) {
    stack.push(intervals.shift());
  }

  intervals.forEach((interval) => {
    const stackTop = stack[stack.length - 1];

    const overlaps = stackTop[0] <= interval[0] && interval[0] <= stackTop[1];

    if (!overlaps) {
      stack.push(interval);
    } else if (interval[1] > stackTop[1]) {
      const newTo = interval[1];
      stackTop[1] = newTo;
    }
  });

  return stack;
};

// Slice

const initialState = {
  allIds: [],
  byId: {},
  byCalendar: {},
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    clearAllEvents: () => initialState,

    addPlaceholderEventUntilCreated: {
      prepare: (payload) => {
        const { error, value } = calendarEventSchema.validate(payload);
        if (error) {
          throw new Error(error);
        }
        return { payload: value };
      },
      reducer: (state, { payload: event }) => {
        const { calendarId, id } = event;

        const allIds = updateArray(state.allIds, { add: [id] });
        const byId = {
          ...(state.byId || {}),
          [id]: { ...event, placeholderUntilCreated: true },
        };
        const byCalendar = {
          ...(state.byCalendar || {}),
          [calendarId]: {
            ...(state.byCalendar && state.byCalendar[calendarId]
              ? state.byCalendar[calendarId]
              : {}),
            allIds: updateArray(state.byCalendar[calendarId].allIds, {
              add: [id],
            }),
          },
        };

        const newState = {
          ...state,
          allIds,
          byId,
          byCalendar,
        };

        sortAllIdsByStartTimestamp(newState, calendarId);
        return addCollisionsToCalendarEvents(newState);
      },
    },

    // @todo: improve this so we're only flagging the calendar that had changes
    //        or even better, pull those changes only
    staleAllEvents: (state) => {
      Object.keys(state.byCalendar).forEach((calendarId) => {
        state.byCalendar[calendarId].intervalsRequested = [];
        state.byCalendar[calendarId].intervalsFetched = [];
      });
    },

    addIntervalRequested: (state, { payload: { interval, calendarId } }) => {
      const intervalsRequested = get(state, [calendarId, 'intervalsRequested'], []);
      const updated = [...intervalsRequested, interval];
      const newState = fpSet(['byCalendar', calendarId, 'intervalsRequested'], updated, state);
      return newState;
    },

    removeIntervalRequested: (state, { payload: { interval, calendarId } }) => {
      if (state.byCalendar[calendarId] && state.byCalendar[calendarId].intervalsRequested) {
        state.byCalendar[calendarId].intervalsRequested = state.byCalendar[
          calendarId
        ].intervalsRequested.filter((i) => i[0] !== interval[0] && i[1] !== interval[1]);
      }
    },

    updateEvents: (state, { payload: { calendarId, events, interval } }) => {
      const eventsUpdated = events.filter((event) => event.status !== 'cancelled');
      const eventIdsRemoved = events
        .filter((event) => event.status === 'cancelled')
        .map((event) => event.id);

      // Remove placeholders that already got a real event
      const newEventByTaskIds = events
        .filter((event) => event.taskId)
        .reduce(
          (memo, event) => ({
            ...memo,
            [event.taskId]: event,
          }),
          {},
        );
      const placeholderEventIdsWithRealEventCreated = state.allIds.filter(
        (id) =>
          get(state.byId[id], 'placeholderUntilCreated') &&
          newEventByTaskIds[get(state.byId[id], 'taskId')],
      );

      const eventIds = eventsUpdated.map((event) => event.id);

      const allIds = updateArray(state.allIds, {
        add: eventIds,
        remove: [...placeholderEventIdsWithRealEventCreated, ...eventIdsRemoved],
      });
      const byId = {
        ...(state.byId || {}),
        ...eventsUpdated.reduce((memo, event) => ({ ...memo, [event.id]: event }), {}),
      };
      const byCalendar = {
        ...(state.byCalendar || {}),
        [calendarId]: {
          ...(state.byCalendar && state.byCalendar[calendarId] ? state.byCalendar[calendarId] : {}),
          allIds: updateArray(state.byCalendar[calendarId].allIds, {
            add: eventIds,
            remove: [...placeholderEventIdsWithRealEventCreated, ...eventIdsRemoved],
          }),
          intervalsFetched: mergeOverlappingIntervals([
            ...(state.byCalendar[calendarId].intervalsFetched || []),
            interval,
          ]),
        },
      };

      const newState = {
        ...state,
        allIds,
        byId,
        byCalendar,
      };

      sortAllIdsByStartTimestamp(newState, calendarId);
      return addCollisionsToCalendarEvents(newState);
    },
  },
});
/* eslint-enable no-param-reassign */

export default slice;
export const {
  clearAllEvents,
  staleAllEvents,
  addPlaceholderEventUntilCreated,
  setCalendarEventsGlobalFetching,
} = slice.actions;

// Thunks

export const loadCalendarEvents = (calendarId, start, end, { errorCallback = () => {} }) => (
  dispatch,
  getState,
) => {
  const state = getState();

  if (selectCalendarEventsIntervalIsRequested(state, calendarId, start, end)) {
    return;
  }
  if (selectCalendarEventsIntervalIsFetched(state, calendarId, start, end)) {
    return;
  }

  dispatch(slice.actions.addIntervalRequested({ calendarId, interval: [start, end] }));

  const providerCalendarId = selectCalendarProviderCalendarId(state, calendarId);

  gapiListCalendarEvents(providerCalendarId, start, end)
    .then((events) => events.map((event) => ({ ...event, calendarId, providerCalendarId })))
    .then((events) => {
      dispatch(slice.actions.updateEvents({ calendarId, events, interval: [start, end] }));
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(slice.actions.removeIntervalRequested({ calendarId, interval: [start, end] }));
      errorCallback(error);
    });
};
