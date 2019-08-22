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
  [SET_USER]: (state: State, { payload: user }: { payload: object }) => ({
    ...state,
    userLoggedIn: user !== null, // Needs to be null, false or true.
    user,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

type State = ReturnType<typeof reducer>;
interface AppState {
  [NAMESPACE]: State,
}

// Selectors

export const selectUserId = (state: AppState) => get(state[NAMESPACE].user, 'uid');
export const selectUserEmail = (state: AppState) => get(state[NAMESPACE].user, 'email', '');
export const selectUserDisplayName = (state: AppState) => get(state[NAMESPACE].user, 'displayName', '');
export const selectUserLoggedIn = (state: AppState) => state[NAMESPACE].userLoggedIn;

// Actions

export const setUser = (user: object | null) => ({
  type: SET_USER,
  payload: user,
});
