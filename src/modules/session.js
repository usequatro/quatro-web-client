/**
 * Namespace to keep information of the current session, like user details.
 */

import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { LOG_OUT } from './reset';

export const NAMESPACE = 'session';

const NOT_DEFINED = 'notDefined';
const LOGGED_IN = 'loggedIn';
const LOGGED_OUT = 'loggedOut';

// Action types

const SET_FIREBASE_USER = `${NAMESPACE}/SET_FIREBASE_USER`;
const SET_GOOGLE_CONNECTED_USER = `${NAMESPACE}/SET_GOOGLE_CONNECTED_USER`;

// Reducers

const INITIAL_STATE = {
  fireaseStatus: NOT_DEFINED,
  firebaseUser: null,
  gapiStatus: NOT_DEFINED,
  gapiUser: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [LOG_OUT]: () => ({ firebaseUser: null, gapiUser: null, status: NOT_DEFINED }),
  [SET_FIREBASE_USER]: (state, { payload: user }) => ({
    ...state,
    fireaseStatus: user ? LOGGED_IN : LOGGED_OUT,
    firebaseUser: user,
  }),
  [SET_GOOGLE_CONNECTED_USER]: (state, { payload: gapiUser }) => ({
    ...state,
    gapiStatus: gapiUser ? LOGGED_IN : LOGGED_OUT,
    gapiUser,
  }),
});

// Selectors

export const selectUserId = (state) => get(state[NAMESPACE], 'firebaseUser.uid');
export const selectUserEmail = (state) => get(state[NAMESPACE], 'firebaseUser.email');
export const selectUserEmailVerified = (state) =>
  get(state[NAMESPACE], 'firebaseUser.emailVerified');
export const selectUserDisplayName = (state) => get(state[NAMESPACE], 'firebaseUser.displayName');
export const selectUserPhotoURL = (state) => get(state[NAMESPACE], 'firebaseUser.photoURL');
export const selectFirebaseUserIsLoggedIn = (state) => state[NAMESPACE].fireaseStatus === LOGGED_IN;
export const selectFirebaseUserLoading = (state) => state[NAMESPACE].fireaseStatus === NOT_DEFINED;
export const selectGoogleFirebaseAuthProvider = (state) =>
  get(state[NAMESPACE], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'google.com',
  );
export const selectPasswordFirebaseAuthProvider = (state) =>
  get(state[NAMESPACE], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'password',
  );

export const selectGapiUserLoading = (state) => state[NAMESPACE].gapiStatus === NOT_DEFINED;
export const selectGapiUserSignedIn = (state) => state[NAMESPACE].gapiStatus === LOGGED_IN;
export const selectGapiUserId = (state) => get(state[NAMESPACE], 'gapiUser.id');
export const selectGapiUserName = (state) => get(state[NAMESPACE], 'gapiUser.name');
export const selectGapiUserEmail = (state) => get(state[NAMESPACE], 'gapiUser.email');
export const selectGapiUserImageUrl = (state) => get(state[NAMESPACE], 'gapiUser.imageUrl');

// Actions

export const setUserFromFirebaseUser = (firebaseUser) => ({
  type: SET_FIREBASE_USER,
  payload:
    firebaseUser === null
      ? null
      : {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData,
        },
});

export const setGapiUser = (gapiUser) => ({
  type: SET_GOOGLE_CONNECTED_USER,
  payload:
    gapiUser === null || gapiUser.getId() === null
      ? null
      : {
          id: gapiUser.getId(),
          name: gapiUser.getBasicProfile().getName(),
          email: gapiUser.getBasicProfile().getEmail(),
          imageUrl: gapiUser.getBasicProfile().getImageUrl(),
        },
});
