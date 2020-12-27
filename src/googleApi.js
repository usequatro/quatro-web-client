import formatISO from 'date-fns/formatISO';
import firebase from './firebase';

// Start promise on load, loading the client lib and initializing it.
const clientLoadPromise = new Promise((resolve) => {
  window.gapi.load('client', resolve);
})
  .then(() =>
    window.gapi.client.init({
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      scope: process.env.REACT_APP_GOOGLE_AUTH_SCOPES,
    }),
  )
  .then(() => window.gapi.client);

// When getting the client, we use this promise so nobody calls it before its ready
const getGapiClient = () => clientLoadPromise;

/**
 * @param {string} providerCalendarId
 * @param {Date} startDate
 * @param {Date} endDate
 * @return {Promise}
 */
export const gapiListCalendarEvents = async (providerCalendarId, startDate, endDate) => {
  const client = await getGapiClient();
  // @see https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientrequestargs--
  return client.request({
    method: 'GET',
    // @see https://developers.google.com/calendar/v3/reference/events/list
    path: `/calendar/v3/calendars/${providerCalendarId}/events`,
    params: {
      timeMin: formatISO(startDate),
      timeMax: formatISO(endDate),
      maxResults: 25,
      singleEvents: true,
    },
  });
};

export const gapiListCalendars = async () => {
  const client = await getGapiClient();
  // @see https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientrequestargs--
  return client.request({
    method: 'GET',
    // @see https://developers.google.com/calendar/v3/reference/calendarList/list
    path: '/calendar/v3/users/me/calendarList',
    params: { maxResults: 25, minAccessRole: 'writer' },
  });
};

export const gapiGetAuthInstance = () =>
  getGapiClient().then(() => window.gapi.auth2.getAuthInstance());

/**
 * @returns {Promise}
 */
export const gapiSignIn = async () => {
  if (firebase.auth().currentUser) {
    throw new Error("signIn isn't expected when Firebase user is already logged in");
  }
  const authInstance = await gapiGetAuthInstance();
  return authInstance.signIn();
};

/**
 * @returns {Promise}
 */
export const gapiSignInExistingUser = async () => {
  const authInstance = await gapiGetAuthInstance();

  return authInstance.signIn().then(async () => {
    const gapiUserId = authInstance.currentUser.get().getId();
    const firebaseGoogleUserId = firebase
      .auth()
      .currentUser.providerData.find(({ providerId }) => providerId === 'google.com').uid;

    if (gapiUserId !== firebaseGoogleUserId) {
      return authInstance.signOut().then(() => {
        throw new Error("Email addresses don't match");
      });
    }
    return undefined;
  });
};