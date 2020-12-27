import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';
import { LOG_OUT } from './reset';

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

// Slice

const initialState = {
  fireaseStatus: NOT_DEFINED,
  firebaseUser: null,
  gapiStatus: NOT_DEFINED,
  gapiUser: null,
};

const slice = createSlice({
  name,
  initialState,
  extraReducers: {
    [LOG_OUT]: () => initialState,
  },
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
                providerData: firebaseUser.providerData,
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
              },
      }),
    },
  },
});

export const { setUserFromFirebaseUser, setGapiUser } = slice.actions;
export default slice;
