import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';
import firebase from '../firebase';
import { CALENDAR_LIST_READ, CALENDAR_EVENTS_MANAGE } from '../constants/googleApiScopes';
import debugConsole from '../utils/debugConsole';

const name = 'session';

const NOT_DEFINED = 'notDefined';
const LOGGED_IN = 'loggedIn';
const LOGGED_OUT = 'loggedOut';

// Selectors

export const selectUserId = (state) => get(state[name], 'firebaseUser.uid');
export const selectUserEmail = (state) => get(state[name], 'firebaseUser.email');
export const selectUserEmailVerified = (state) => get(state[name], 'firebaseUser.emailVerified');
export const selectUserDisplayName = (state) => get(state[name], 'firebaseUser.displayName');
export const selectUserPhotoURL = (state) => get(state[name], 'firebaseUser.photoURL');
export const selectFirebaseUserIsLoggedIn = (state) => state[name].fireaseStatus === LOGGED_IN;
export const selectFirebaseUserLoading = (state) => state[name].fireaseStatus === NOT_DEFINED;
export const selectGoogleFirebaseAuthProvider = (state) =>
  get(state[name], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'google.com',
  );
export const selectPasswordFirebaseAuthProvider = (state) =>
  get(state[name], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'password',
  );
export const selectGapiUserLoading = (state) => state[name].gapiStatus === NOT_DEFINED;
export const selectGapiUserSignedIn = (state) => state[name].gapiStatus === LOGGED_IN;
export const selectGapiUserId = (state) => get(state[name], 'gapiUser.id');
export const selectGapiUserName = (state) => get(state[name], 'gapiUser.name');
export const selectGapiUserEmail = (state) => get(state[name], 'gapiUser.email');
export const selectGapiUserImageUrl = (state) => get(state[name], 'gapiUser.imageUrl');

export const selectGapiHasCalendarListScope = (state) => {
  const scopes = get(state[name], 'gapiUser.scopes', []);
  return scopes.includes(CALENDAR_LIST_READ);
};
export const selectGapiHasEventsManageScope = (state) => {
  const scopes = get(state[name], 'gapiUser.scopes', []);
  return scopes.includes(CALENDAR_EVENTS_MANAGE);
};
export const selectGapiHasAllCalendarScopes = (state) =>
  selectGapiHasCalendarListScope(state) && selectGapiHasEventsManageScope(state);

// Slice

const initialState = {
  fireaseStatus: NOT_DEFINED,
  firebaseUser: null,
  gapiStatus: NOT_DEFINED,
  gapiUser: null,
};

/* eslint-disable no-param-reassign */
const slice = createSlice({
  name,
  initialState,
  reducers: {
    setUserFromFirebaseUser: {
      reducer: (state, { payload }) => ({
        ...state,
        fireaseStatus: payload ? LOGGED_IN : LOGGED_OUT,
        firebaseUser: payload,
      }),
      /**
       * @param {firebase.User} firebaseUser
       */
      prepare: (firebaseUser) => ({
        payload:
          firebaseUser === null
            ? null
            : {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                // Provider data is an array of special objects, so mapping so its serializable
                providerData: firebaseUser.providerData.map((provider) => ({ ...provider })),
              },
      }),
    },
    setGapiUser: {
      reducer: (state, { payload }) => ({
        ...state,
        gapiStatus: payload ? LOGGED_IN : LOGGED_OUT,
        gapiUser: payload,
      }),
      prepare: (gapiUser) => ({
        payload:
          gapiUser === null || gapiUser.getId() === null
            ? null
            : {
                id: gapiUser.getId(),
                name: gapiUser.getBasicProfile().getName(),
                email: gapiUser.getBasicProfile().getEmail(),
                imageUrl: gapiUser.getBasicProfile().getImageUrl(),
                scopes: gapiUser.getGrantedScopes().split(' '),
              },
      }),
    },
  },
});
/* eslint-enable no-param-reassign */

export const { setUserFromFirebaseUser, setGapiUser } = slice.actions;
export default slice;

// Thunks

/**
 * Sets the Firebase user as not logged-in if it still wasn't defined
 * This is a fallback to take when firebase.auth().onAuthStateChanged() isn't called
 */
export const considerGivingUpFirebaseAuthStatusWait = () => (dispatch, getState) => {
  const firebaseAuthStatusStillNotDefined = selectFirebaseUserLoading(getState());
  if (!firebase.auth().currentUser && firebaseAuthStatusStillNotDefined) {
    debugConsole.log(
      'Firebase',
      'onAuthStateChanged() not called after timeout, so considering user logged-out',
    );
    dispatch(setUserFromFirebaseUser(null));
  } else {
    debugConsole.log('Firebase', 'no need to force Firebase user status to logged-out');
  }
};
