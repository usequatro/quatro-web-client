import get from 'lodash/get';
import set from 'lodash/set';
import intersection from 'lodash/intersection';
import { createSlice } from '@reduxjs/toolkit';
import Joi from '@hapi/joi';

import format from 'date-fns/format';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';

// import debugConsole from '../utils/debugConsole';
import { gapiListCalendarEvents } from '../googleApi';
import { timestampSchema } from '../utils/validators';
import updateArray from '../utils/updateArray';
import * as RESPONSE_STATUS from '../constants/responseStatus';

// Allow dependency cycle because it's just for selectors
// eslint-disable-next-line import/no-cycle
import { selectCalendarProviderCalendarId, selectCalendarIds } from './calendars';

import { DEFAULT, PUBLIC, PRIVATE, CONFIDENTIAL } from '../constants/eventVisibilities';
import * as EVENT_TYPES from '../constants/eventTypes';

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
  conferenceData: Joi.object({
    // here's the useful information subset of the calendar API conference data
    solutionIconUri: Joi.string(),
    solutionName: Joi.string(),
    entryPoints: Joi.array().items(
      Joi.object({
        type: Joi.string(),
        label: Joi.string(),
        uri: Joi.string(),
        meetingCode: Joi.string(),
        passcode: Joi.string(),
        password: Joi.string(),
        pin: Joi.string(),
        regionCode: Joi.string(),
      }),
    ),
  })
    .allow(null)
    .default(null),
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
  responseStatus: Joi.string(),
  attendees: Joi.array()
    .items(
      Joi.object({
        id: Joi.string(),
        displayName: Joi.string(),
        email: Joi.string(),
        comment: Joi.string(),
        responseStatus: Joi.valid(
          RESPONSE_STATUS.ACCEPTED,
          RESPONSE_STATUS.DECLINED,
          RESPONSE_STATUS.TENTATIVE,
          RESPONSE_STATUS.NEEDS_ACTION,
        ),
        optional: Joi.bool(),
        organizer: Joi.bool(),
        resource: Joi.bool(),
        self: Joi.bool(),
      }),
    )
    .default([]),
  allDay: Joi.bool(),
  declined: Joi.bool(),
  visibility: Joi.valid(DEFAULT, PUBLIC, PRIVATE, CONFIDENTIAL), // present when user is organizer
  eventType: Joi.valid(EVENT_TYPES.DEFAULT, EVENT_TYPES.OUT_OF_OFFICE),
  taskId: Joi.string().allow(null),
  taskCompleted: Joi.bool(),
});

const formatDate = (timestamp) => format(timestamp, 'yyyy-MM-dd');

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
/** @returns {Array<Object>} */
export const selectCalendarEventConferenceData = (state, id) =>
  get(state[name].byId[id], 'conferenceData', []);
export const selectCalendarEventAllDay = (state, id) => get(state[name].byId[id], 'allDay');
/** @returns {string|undefined} */
export const selectCalendarEventVisibility = (state, id) => get(state[name].byId[id], 'visibility');
/** @returns {string|undefined} */
export const selectCalendarEventEventType = (state, id) => get(state[name].byId[id], 'eventType');
export const selectCalendarEventResponseStatus = (state, id) =>
  get(state[name].byId[id], 'responseStatus');
export const selectCalendarEventAttendees = (state, id) =>
  get(state[name].byId[id], 'attendees', []);
export const selectCalendarEventCollisionCount = (state, id) =>
  get(state[name].byId[id], 'collisionCount');
export const selectCalendarEventCollisionOrder = (state, id) =>
  get(state[name].byId[id], 'collisionOrder');
export const selectCalendarEventCalendarId = (state, id) => get(state[name].byId[id], 'calendarId');
export const selectCalendarEventProviderCalendarId = (state, id) =>
  get(state[name].byId[id], 'providerCalendarId');
export const selectCalendarEventTaskId = (state, id) => get(state[name].byId[id], 'taskId');
export const selectCalendarEventTaskCompleted = (state, id) =>
  Boolean(get(state[name].byId[id], 'taskCompleted'));
export const selectCalendarEventPlaceholderUntilCreated = (state, id) =>
  get(state[name].byId[id], 'placeholderUntilCreated');
/** @returns {string|undefined} */
export const selectCalendarEventIdByTaskId = (state, taskId) =>
  state[name].allIds.find((id) => selectCalendarEventTaskId(state, id) === taskId);

const selectCalendarEventsDateRequested = (state, calendarId, date) => {
  const dateKey = formatDate(date);
  return Boolean(get(state[name].byCalendar, [calendarId, 'statusByDate', dateKey, 'requested']));
};

const selectCalendarEventsDateLoaded = (state, calendarId, date) => {
  const dateKey = formatDate(date);
  return Boolean(get(state[name].byCalendar, [calendarId, 'statusByDate', dateKey, 'loaded']));
};

/** @returns {number|undefined} */
const selectCalendarEventsDateLastFetched = (state, calendarId, date) => {
  const dateKey = formatDate(date);
  return get(state[name].byCalendar, [calendarId, 'statusByDate', dateKey, 'lastFetchTimestamp']);
};

export const selectCalendarEventsTimeNeedsFetching = (state, calendarId, timestamp) =>
  !selectCalendarEventsDateRequested(state, calendarId, timestamp);

export const selectCalendarEventsTimeIsFetching = (state, timestamp) => {
  const calendarIds = selectCalendarIds(state);

  const fetching = calendarIds.reduce((memo, calendarId) => {
    if (memo) {
      return memo;
    }
    const requested = selectCalendarEventsDateRequested(state, calendarId, timestamp);
    const loaded = selectCalendarEventsDateLoaded(state, calendarId, timestamp);
    return requested && !loaded;
  }, false);

  return Boolean(fetching);
};

/** @return {Array<string>} */
export const selectCalendarEventIdsForDate = (state, timestamp) => {
  const start = startOfDay(timestamp).getTime();
  const end = endOfDay(timestamp).getTime();
  return state[name].allIds.filter((eventId) => {
    const allDay = selectCalendarEventAllDay(state, eventId);
    if (allDay) {
      return false;
    }
    const eventStart = selectCalendarEventStartTimestamp(state, eventId);
    const eventEnd = selectCalendarEventEndTimestamp(state, eventId);

    return (
      // events starting today
      (eventStart >= start && eventStart < end) ||
      // events ending today
      (eventEnd <= end && eventEnd > start) ||
      // events starting before today and ending after today
      (eventStart <= start && eventEnd >= end)
    );
  });
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
export const selectCalendarEventIdsForNotifications = (state, calendarId, { earliest, latest }) =>
  state[name].allIds.filter(
    (eventId) =>
      selectCalendarEventCalendarId(state, eventId) === calendarId &&
      !selectCalendarEventAllDay(state, eventId) &&
      !selectCalendarEventPlaceholderUntilCreated(state, eventId) &&
      selectCalendarEventStartTimestamp(state, eventId) >= earliest &&
      selectCalendarEventStartTimestamp(state, eventId) <= latest,
  );

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
    const eventIdsScanned = Object.keys(memo);
    const collisionIds = getCollisions(event, allEvents);
    const collisionsAlreadyScannedPreviously = intersection(eventIdsScanned, collisionIds);
    return {
      ...memo,
      [event.id]: {
        ...event,
        collisionCount: collisionIds.length,
        collisionOrder: (event.collisionOrder || 0) + collisionsAlreadyScannedPreviously.length,
      },
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

// Slice

const initialState = {
  allIds: [],
  byId: {},
  byCalendar: {
    // shape:
    // [id]: {
    //   allIds: array
    //   statusByDate: {
    //     '2021-03-26': {
    //       lastFetchTimestamp: number,
    //       requested: boolean,
    //       loaded: boolean,
    //     }
    //   }
    // }
  },
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    clearAllEvents: () => initialState,

    setLastFetchTimestamp: (state, { payload: { calendarId, lastFetchTimestamp, date } }) => {
      const dateKey = formatDate(date);
      set(
        state.byCalendar,
        [calendarId, 'statusByDate', dateKey, 'lastFetchTimestamp'],
        lastFetchTimestamp,
      );
    },

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
            ...get(state, ['byCalendar', calendarId], {}),
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

    staleAllEventsForCalendar: (state, { payload: calendarIdsChanged }) => {
      calendarIdsChanged.forEach((calendarId) => {
        if (state.byCalendar[calendarId] && state.byCalendar[calendarId].statusByDate) {
          Object.keys(state.byCalendar[calendarId].statusByDate).forEach((dateKey) => {
            set(state.byCalendar, [calendarId, 'statusByDate', dateKey, 'requested'], false);
          });
        }
      });
    },

    setDateRequested: (state, { payload: { date, calendarId, value } }) => {
      const dateKey = formatDate(date);
      set(state.byCalendar, [calendarId, 'statusByDate', dateKey, 'requested'], Boolean(value));
    },

    updateEvents: (state, { payload: { calendarId, events, date } }) => {
      const validatedEvents = events
        .map((event) => {
          const { error, value } = calendarEventSchema.validate(event);
          if (error) {
            console.error(error); // eslint-disable-line no-console
            return null;
          }
          return value;
        })
        .filter(Boolean);

      const dateKey = formatDate(date);
      const isEventRemoved = (event) =>
        event.status === 'cancelled' || event.responseStatus === RESPONSE_STATUS.DECLINED;
      const eventsUpdated = validatedEvents.filter((event) => !isEventRemoved(event));
      const eventIdsRemoved = validatedEvents.filter(isEventRemoved).map((event) => event.id);

      // Remove placeholders that already got a real event
      const newEventByTaskIds = validatedEvents
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
          ...get(state, ['byCalendar', calendarId], {}),
          allIds: updateArray(state.byCalendar[calendarId].allIds, {
            add: eventIds,
            remove: [...placeholderEventIdsWithRealEventCreated, ...eventIdsRemoved],
          }),
          statusByDate: {
            ...get(state, ['byCalendar', calendarId, 'statusByDate'], {}),
            [dateKey]: {
              ...get(state, ['byCalendar', calendarId, 'statusByDate', dateKey], {}),
              loaded: true,
            },
          },
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
  staleAllEventsForCalendar,
  addPlaceholderEventUntilCreated,
  setCalendarEventsGlobalFetching,
} = slice.actions;

// Thunks

export const loadCalendarEvents =
  (calendarId, date, { errorCallback = () => {} }) =>
  (dispatch, getState) => {
    const state = getState();
    if (selectCalendarEventsDateRequested(state, calendarId, date)) {
      return;
    }

    dispatch(slice.actions.setDateRequested({ calendarId, date, value: true }));

    const providerCalendarId = selectCalendarProviderCalendarId(state, calendarId);

    // We want to use the last fetch timestamp when we're refreshing an already loaded interval
    const lastFetchTimestamp = selectCalendarEventsDateLastFetched(state, calendarId, date);
    const newFetchTimestamp = Date.now();
    dispatch(
      slice.actions.setLastFetchTimestamp({
        calendarId,
        lastFetchTimestamp: newFetchTimestamp,
        date,
      }),
    );

    const start = startOfDay(date).getTime();
    const end = endOfDay(date).getTime();

    const wasAlreadyLoaded = selectCalendarEventsDateLoaded(state, calendarId, date);

    gapiListCalendarEvents(providerCalendarId, start, end, {
      updatedMin: lastFetchTimestamp,
      showDeleted: wasAlreadyLoaded,
    })
      .then((events) => events.map((event) => ({ ...event, calendarId, providerCalendarId })))
      .then((events) => {
        dispatch(slice.actions.updateEvents({ calendarId, events, date }));
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console

        // Restore last fetched timestamp if it didn't change in the meantime
        const currentFetchTimestamp = selectCalendarEventsDateLastFetched(state, calendarId, date);
        if (currentFetchTimestamp === newFetchTimestamp) {
          dispatch(slice.actions.setLastFetchTimestamp({ calendarId, lastFetchTimestamp, date }));
        }

        errorCallback(error);
      });
  };
