import formatISO from 'date-fns/formatISO';
import firebase from './firebase';
import REGION from './constants/region';
import debugConsole from './utils/debugConsole';
import {
  PROFILE,
  EMAIL,
  CALENDAR_LIST_READ,
  CALENDAR_EVENTS_MANAGE,
} from './constants/googleApiScopes';

// Start promise on load, loading the client lib and initializing it.
const clientLoadPromise = new Promise((resolve) => {
  window.gapi.load('client', resolve);
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

/**
 * @link https://developers.google.com/calendar/v3/reference/events/list
 * @param {string} providerCalendarId
 * @param {Date} startDate
 * @param {Date} endDate
 * @return {Promise}
 */
export const gapiListCalendarEvents = async (providerCalendarId, startDate, endDate) => {
  return request({
    method: 'GET',
    path: `/calendar/v3/calendars/${providerCalendarId}/events`,
    params: {
      maxAttendees: 1, // only return the current user, not the others (not needed)
      timeMin: formatISO(startDate),
      timeMax: formatISO(endDate),
      maxResults: 25,
      singleEvents: true,
    },
  });
};

/**
 * @link https://developers.google.com/calendar/v3/reference/calendarList/list
 */
export const gapiListCalendars = async () => {
  return request({
    method: 'GET',
    path: '/calendar/v3/users/me/calendarList',
    params: { maxResults: 25, minAccessRole: 'writer' },
  });
};

/**
 * @todo scopes should be revoked as well from a backend function if the tokens are persisted
 * @link https://developers.google.com/identity/sign-in/web/reference#googleauthdisconnect
 */
export const revokeAllScopes = async () => {
  const auth2 = await gapiGetAuthInstance();
  const currentUser = auth2.currentUser.get();
  return currentUser.isSignedIn() ? currentUser.disconnect() : undefined;
};
