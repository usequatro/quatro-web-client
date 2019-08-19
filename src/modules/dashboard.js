import createReducer from '../util/createReducer';
import { loadTasks, resetTasks } from './tasks';

export const NAMESPACE = 'dashboard';

// Action types

const SET_LOAD_FLAGS = `${NAMESPACE}/SET_LOAD_FLAGS`;
const RESET = `${NAMESPACE}/RESET`;
const SET_DASHBOARD_MENU_OPEN = `${NAMESPACE}/SET_DASHBOARD_MENU_OPEN`;
const SET_ACCOUNT_MENU_OPEN = `${NAMESPACE}/SET_ACCOUNT_MENU_OPEN`;

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
  dashboardMenuOpen: false,
  accountMenuOpen: false,
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
  [SET_DASHBOARD_MENU_OPEN]: (state, { payload: dashboardMenuOpen }) => ({
    ...state,
    dashboardMenuOpen,
  }),
  [SET_ACCOUNT_MENU_OPEN]: (state, { payload: accountMenuOpen }) => ({
    ...state,
    accountMenuOpen,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

// Selectors

export const selectLoading = (state, view) => state[NAMESPACE][view].loading;
export const selectLoaded = (state, view) => state[NAMESPACE][view].loaded;
export const selectDashboardMenuOpen = state => state[NAMESPACE].dashboardMenuOpen;
export const selectAccountMenuOpen = state => state[NAMESPACE].accountMenuOpen;

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

export const resetDashboard = () => ({ type: RESET });

export const resumeDashboardActivity = (() => {
  let lastTime = Date.now();
  const timeout = 1000 * 60 * 30; // 30 minutes;

  return () => (dispatch) => {
    const now = Date.now();
    if (now > lastTime + timeout) {
      console.log('[resumeDashboardActivity] Refreshing tasks due to resumed activity');
      dispatch(resetTasks());
      dispatch(resetDashboard());
    }
    lastTime = now;
  };
})();

export const setDashboardMenuOpen = dashboardMenuOpen => ({
  type: SET_DASHBOARD_MENU_OPEN,
  payload: dashboardMenuOpen,
});
export const setAccountMenuOpen = accountMenuOpen => ({
  type: SET_ACCOUNT_MENU_OPEN,
  payload: accountMenuOpen,
});
