/**
 * Namespace to keep information of the current session, like user details.
 */

import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { RESET } from './reset';

export const NAMESPACE = 'session';

// Action types

const SET_FIREBASE_USER = `${NAMESPACE}/SET_FIREBASE_USER`;
const SET_GOOGLE_CONNECTED_USER = `${NAMESPACE}/SET_GOOGLE_CONNECTED_USER`;

// Reducers

const INITIAL_STATE = {
  userIsLoggedIn: null,
  firebaseUser: null,
  gapiUser: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_FIREBASE_USER]: (state, { payload: user }) => ({
    ...state,
    userIsLoggedIn: user !== null, // Needs to be null, false or true.
    firebaseUser: user,
  }),
  [SET_GOOGLE_CONNECTED_USER]: (state, { payload: gapiUser }) => ({
    ...state,
    gapiUser,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectUserId = (state) => get(state[NAMESPACE], 'firebaseUser.uid');
export const selectUserEmail = (state) => get(state[NAMESPACE], 'firebaseUser.email');
export const selectUserEmailVerified = (state) =>
  get(state[NAMESPACE], 'firebaseUser.emailVerified');
export const selectUserDisplayName = (state) => get(state[NAMESPACE], 'firebaseUser.displayName');
export const selectUserPhotoURL = (state) => get(state[NAMESPACE], 'firebaseUser.photoURL');
export const selectUserIsLoggedIn = (state) => state[NAMESPACE].userIsLoggedIn;
export const selectGoogleFirebaseAuthProvider = (state) =>
  get(state[NAMESPACE], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'google.com',
  );
export const selectPasswordFirebaseAuthProvider = (state) =>
  get(state[NAMESPACE], 'firebaseUser.providerData', []).find(
    ({ providerId }) => providerId === 'password',
  );

export const selectGapiUserSignedIn = (state) => Boolean(state[NAMESPACE].gapiUser);
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
