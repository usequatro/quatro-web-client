/**
 * Namespace to keep information of the current session, like user details.
 */

import get from 'lodash/get';

import createReducer from '../util/createReducer';
import { RESET } from './reset';

export const NAMESPACE = 'session';

// Action types

const SET_USER = `${NAMESPACE}/SET_USER`;

// Reducers

const INITIAL_STATE = {
  userLoggedIn: null,
  user: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_USER]: (state, { payload: user }) => ({
    ...state,
    userLoggedIn: user !== null, // Needs to be null, false or true.
    user,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectUserId = (state) => get(state[NAMESPACE].user, 'uid');
export const selectUserEmail = (state) => get(state[NAMESPACE].user, 'email', '');
export const selectUserDisplayName = (state) => get(state[NAMESPACE].user, 'displayName', '');
export const selectUserLoggedIn = (state) => state[NAMESPACE].userLoggedIn;

// Actions

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});
