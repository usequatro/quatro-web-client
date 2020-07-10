/**
 * Namespace to keep information of the current session, like user details.
 */

import createReducer from '../utils/createReducer';
import { RESET } from './reset';

export const NAMESPACE = 'registration';

// Action types

const SET_EMAIL = `${NAMESPACE}/SET_EMAIL`;

// Reducers

const INITIAL_STATE = {
  email: '',
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_EMAIL]: (state, { payload }) => ({ ...state, email: payload }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectRegistrationEmail = (state) => state[NAMESPACE].email;

// Actions

export const setRegistrationEmail = (email) => ({
  type: SET_EMAIL,
  payload: email
});
