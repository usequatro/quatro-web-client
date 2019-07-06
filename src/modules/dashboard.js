import createReducer from '../util/createReducer';
import { loadTasks } from './tasks';

export const NAMESPACE = 'dashboard';

// Action types

const SET_LOAD_FLAGS = `${NAMESPACE}/SET_LOAD_FLAGS`;

// Reducers

const INITIAL_STATE = {
  default: {
    loading: false,
    loaded: false,
  },
  completed: {
    loading: false,
    loaded: false,
  },
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_LOAD_FLAGS]: (state, { payload: { loading, loaded, view } }) => ({
    ...state,
    [view]: {
      ...(state[view] || {}),
      loading,
      loaded,
    },
  }),
});

// Selectors

export const selectLoading = (state, view) => state[NAMESPACE][view].loading;
export const selectLoaded = (state, view) => state[NAMESPACE][view].loaded;

// Actions

const setLoadFlags = (view, { loading, loaded }) => ({
  type: SET_LOAD_FLAGS,
  payload: { view, loading, loaded },
});

export const FETCH_PARAMS_COMPLETED = { completed: ['>', 0] };

export const loadDashboardTasks = (view = 'default', fetchParams = undefined) => (dispatch) => {
  dispatch(setLoadFlags(view, { loading: true, loaded: false }));

  dispatch(loadTasks(fetchParams))
    .then(() => {
      dispatch(setLoadFlags(view, { loading: false, loaded: true }));
    })
    .catch((error) => {
      console.error(error);
      dispatch(setLoadFlags(view, { loading: false, loaded: false }));
    });
};
