/**
 * Namespace to keep information of the current session, like user details.
 */

import pick from 'lodash/pick';
import get from 'lodash/get';

import createReducer from '../utils/createReducer';
import { RESET } from './reset';

export const NAMESPACE = 'session';

// Action types

const SET_USER = `${NAMESPACE}/SET_USER`;

// Reducers

const INITIAL_STATE = {
  userIsLoggedIn: null,
  user: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_USER]: (state, { payload: user }) => ({
    ...state,
    userIsLoggedIn: user !== null, // Needs to be null, false or true.
    user,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectUserId = (state) => get(state[NAMESPACE], 'user.uid');
export const selectUserEmail = (state) => get(state[NAMESPACE], 'user.email');
export const selectUserEmailVerified = (state) => get(state[NAMESPACE], 'user.emailVerified');
export const selectUserDisplayName = (state) => get(state[NAMESPACE], 'user.displayName');
export const selectUserPhotoURL = (state) => get(state[NAMESPACE], 'user.photoURL');
export const selectUserIsLoggedIn = (state) => state[NAMESPACE].userIsLoggedIn;

// Actions

export const setUserFromFirebaseUser = (user) => ({
  type: SET_USER,
  payload: user === null
    ? null
    : pick(user, ['uid', 'displayName', 'photoURL', 'email', 'emailVerified']),
});
