/**
 * Google Auth and Google Calendar related states.
 */

import createReducer from '../utils/createReducer';

export const NAMESPACE = 'googlecalendar';


// Action types
const SET_GOOGLE_API_CLIENT = `${NAMESPACE}/SET_GOOGLE_API_CLIENT`;
const SET_GOOGLE_SIGN_IN_STATUS = `${NAMESPACE}/SET_GOOGLE_SIGN_IN_STATUS`;

const INITIAL_STATE = {
  googleAPIClient: null,
  googleSignInStatus: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_GOOGLE_API_CLIENT]: (state, { payload }) => ({ ...state, googleAPIClient: payload }),
  [SET_GOOGLE_SIGN_IN_STATUS]: (state, { payload }) => ({ ...state, googleSignInStatus: payload }),
});

// Selectors

export const selectGoogleAPIClient= (state) => state[NAMESPACE].googleAPIClient;
export const selectGoogleSignInStatus= (state) => state[NAMESPACE].googleSignInStatus;

export const setGoogleAPIClient = (client) => ({
  type: SET_GOOGLE_API_CLIENT,
  payload: client,
});


// Actions

export const setGoogleSignInStatus = (status) => ({
  type: SET_GOOGLE_SIGN_IN_STATUS,
  payload: status,
});