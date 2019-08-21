import get from 'lodash/get';
import createReducer from '../util/createReducer';
import { RESET } from './reset';

export const NAMESPACE = 'session';

// Action types

const SET_USER = `${NAMESPACE}/SET_USER`;

// Reducers

const INITIAL_STATE = {
  user: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_USER]: (state, { payload: user }) => ({
    ...state,
    user,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectUserId = state => get(state[NAMESPACE].user, 'uid');
export const selectUserEmail = state => get(state[NAMESPACE].user, 'email', '');
export const selectUserDisplayName = state => get(state[NAMESPACE].user, 'displayName', '');
export const selectUserLoggedIn = state => state[NAMESPACE].user !== null;

// Actions

export const setUser = user => ({
  type: SET_USER,
  payload: user,
});
