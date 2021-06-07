import formatISO from 'date-fns/formatISO';
import parseISO from 'date-fns/parseISO';
import parse from 'date-fns/parse';
import startOfDay from 'date-fns/startOfDay';
import get from 'lodash/get';

import firebase from './firebase';
import REGION from './constants/region';
import debugConsole from './utils/debugConsole';
import {
  PROFILE,
  EMAIL,
  CALENDAR_LIST_READ,
  CALENDAR_EVENTS_MANAGE,
} from './constants/googleApiScopes';
import { DECLINED } from './constants/responseStatus';

// Start promise on load, loading the client lib and initializing it.
const clientLoadPromise = new Promise((resolve) => {
  if (process.env.NODE_ENV === 'test') {
    window.gapi = {
      client: {},
      auth2: {},
    };
  } else {
    window.gapi.load('client', resolve);
  }
})
  .then(() =>
    window.gapi.client.init({
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      scope: `${PROFILE} ${EMAIL}`,
    }),
  )
  .then(() => window.gapi.client);

// When getting the client, we use this promise so nobody calls it before its ready
const getGapiClient = () => clientLoadPromise;

export const gapiGetAuthInstance = (() => {
  let promise;
  return () => {
    if (promise) {
      return promise;
    }
    promise = getGapiClient().then(() => window.gapi.auth2.getAuthInstance());
    return promise;
  };
})();

/**
 * @link https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientrequestargs--
 */
const request = async (obj) => {
  debugConsole.log('Google API', `${obj.method} ${obj.path}`, obj.params, obj.body);
  const client = await getGapiClient();
  return client.request(obj);
};

export const gapiGrantCalendarManagementScope = async () => {
  const auth2 = await gapiGetAuthInstance();
  // don't check if user already has access already, as we still need a new auth code
  return auth2
    .grantOfflineAccess({
      scope: `${CALENDAR_LIST_READ} ${CALENDAR_EVENTS_MANAGE}`,
    })
    .then(({ code }) => {
      debugConsole.log('Google API', 'Retrieved offline code. Sending to backend now');
      const storeAuthCode = firebase.app().functions(REGION).httpsCallable('storeAuthCode');

      return storeAuthCode({ code }).then(() => {
        debugConsole.log('Google API', 'Code processed');
      });
    });
};

const parseTimestamp = (dateObject) => {
  if (dateObject.dateTime) {
    return parseISO(dateObject.dateTime).getTime();
  }
  if (dateObject.date) {
    return parse(dateObject.date, 'yyyy-MM-dd', startOfDay(new Date())).getTime();
  }
  return undefined;
};

const ALL_DAY_DATE_REGEXP = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/; // all day date yyyy-MM-dd

/** @returns {string|undefined} */
const getSelfResponseStatus = (item) => {
  const selfAttendee = (item.attendees || []).find((attendee) => attendee.self);
  return selfAttendee && selfAttendee.responseStatus ? selfAttendee.responseStatus : undefined;
};

const formatCalendarAPIFormat = (item, providerCalendarId) => {
  const responseStatus = getSelfResponseStatus(item);

  // We intentionally skip declined invites
  if (responseStatus === DECLINED) {
    return null;
  }

  const startTimestamp = parseTimestamp(item.start);
  const endTimestamp = parseTimestamp(item.end);

  const allDay =
    ALL_DAY_DATE_REGEXP.test(item.start.date) && ALL_DAY_DATE_REGEXP.test(item.end.date);

  const event = {
    id: `${providerCalendarId.replace(/[^a-z0-9]/gi, '')}-${item.id}`,
    calendarId: item.calendarId,
    htmlLink: item.htmlLink,
    summary: item.summary,
    status: item.status,
    description: item.description,
    location: item.location,
    start: {
      dateTime: item.start.dateTime,
      timestamp: startTimestamp,
      timeZone: item.start.timeZone,
    },
    end: {
      dateTime: item.end.dateTime,
      timestamp: endTimestamp,
      timeZone: item.end.timeZone,
    },
    attendees: [...(item.attendees || [])].sort((a, b) => {
      if (a.organizer) {
        return -1;
      }
      if (b.organizer) {
        return 1;
      }
      if (a.self) {
        return -1;
      }
      if (b.self) {
        return 1;
      }
      const aValue = (a.displayName || a.email || '').toLowerCase();
      const bValue = (b.displayName || b.email || '').toLowerCase();

      if (aValue > bValue) {
        return 1;
      }
      if (aValue < bValue) {
        return -1;
      }
      return 0;
    }),
    allDay,
    responseStatus,
    taskId: get(item, 'extendedProperties.private.taskId', null),
    taskCompleted: parseInt(get(item, 'extendedProperties.private.completed', '0'), 10) > 0,
    eventType: item.eventType,
    visibility: item.visibility,
  };
  return event;
};

/**
 * @link https://developers.google.com/calendar/v3/reference/events/list
 * @param {string} providerCalendarId
 * @param {number} startDate - timestamp
 * @param {number} endDate - timestamp
 * @param {Object} filters
 * @param {number} filters.updatedMin - timestamp
 * @param {boolean} filters.showDeleted
 * @return {Promise}
 */
export const gapiListCalendarEvents = async (
  providerCalendarId,
  startDate,
  endDate,
  { updatedMin, showDeleted },
) =>
  request({
    method: 'GET',
    path: `/calendar/v3/calendars/${providerCalendarId}/events`,
    params: {
      timeMin: formatISO(startDate),
      timeMax: formatISO(endDate),
      updatedMin: updatedMin ? formatISO(updatedMin) : undefined,
      maxResults: 45,
      showDeleted,
      singleEvents: true,
    },
  }).then((response) => {
    debugConsole.log('Google API', providerCalendarId, response.result.items);
    return response.result.items
      .map((item) => formatCalendarAPIFormat(item, providerCalendarId))
      .filter(Boolean);
  });

/**
 * @link https://developers.google.com/calendar/v3/reference/events/update
 * @param {string} providerCalendarId
 * @param {string} eventId
 * @param {string} updatedResponseStatus
 * @param {array} attendees
 * @return {Promise}
 */
export const gapiUpdateCalendarEventResponseStatus = async (
  providerCalendarId,
  eventId,
  updatedResponseStatus,
  attendees,
) => {
  const updatedAttendees = attendees.map((attendee) =>
    attendee.self ? { ...attendee, responseStatus: updatedResponseStatus } : attendee,
  );

  await request({
    method: 'PATCH',
    path: `/calendar/v3/calendars/${providerCalendarId}/events/${eventId}`,
    body: {
      attendees: updatedAttendees,
    },
  });
  debugConsole.log('Google API', 'Calendar event updated successfully');
};

/**
 * @link https://developers.google.com/calendar/v3/reference/calendarList/list
 */
export const gapiListCalendars = async () =>
  request({
    method: 'GET',
    path: '/calendar/v3/users/me/calendarList',
    params: { maxResults: 250, minAccessRole: 'writer' },
  });
/**
 * @todo scopes should be revoked as well from a backend function if the tokens are persisted
 * @link https://developers.google.com/identity/sign-in/web/reference#googleauthdisconnect
 */
export const revokeAllScopes = async () => {
  const auth2 = await gapiGetAuthInstance();
  const currentUser = auth2.currentUser.get();
  return currentUser.isSignedIn() ? currentUser.disconnect() : undefined;
};
