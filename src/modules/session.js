import createReducer from '../util/createReducer';

export const NAMESPACE = 'session';

// Action types

const SET_USER = `${NAMESPACE}/SET_USER`;

// Reducers

const INITIAL_STATE = {
  userLoggedIn: null, // null until we know
  userId: null,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_USER]: (state, { payload: userId }) => ({
    ...state,
    userLoggedIn: userId !== null,
    userId,
  }),
});

// Selectors

export const selectUserId = state => state[NAMESPACE].userId;
export const selectUserLoggedIn = state => state[NAMESPACE].userLoggedIn;

// Actions

export const setUser = userId => ({
  type: SET_USER,
  payload: userId,
});
