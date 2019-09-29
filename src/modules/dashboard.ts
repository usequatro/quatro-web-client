import uniq from 'lodash/uniq';

import createReducer from '../util/createReducer';
import { loadTasks, resetTasks, loadRecurringConfigs } from './tasks';
import { RESET } from './reset';
import { Task } from '../types';

export const NAMESPACE = 'dashboard';

// Action types

const SET_LOAD_FLAGS = `${NAMESPACE}/SET_LOAD_FLAGS`;
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
  accountMenuOpen: false,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SET_LOAD_FLAGS]: (
    state:S,
    { payload: { loading, loaded, view } }:{payload:{loading:boolean, loaded:boolean, view:string}},
  ) => ({
    ...state,
    [view]: {
      ...(state[view] || {}),
      loading,
      loaded,
    },
  }),
  [SET_ACCOUNT_MENU_OPEN]: (
    state:S,
    { payload: accountMenuOpen }:{payload: boolean},
  ) => ({
    ...state,
    accountMenuOpen,
  }),
  [RESET]: () => ({ ...INITIAL_STATE }),
});

type S = ReturnType<typeof reducer>;
type AS = { [NAMESPACE]: S };

// Selectors

export const selectLoading = (state:AS, view:string) => state[NAMESPACE][view].loading;
export const selectLoaded = (state:AS, view:string) => state[NAMESPACE][view].loaded;
export const selectAccountMenuOpen = (state:AS) => state[NAMESPACE].accountMenuOpen;

// Actions

const setLoadFlags = (view: string, { loading, loaded }:{ loading:boolean, loaded:boolean }) => ({
  type: SET_LOAD_FLAGS,
  payload: { view, loading, loaded },
});

export const loadDashboardTasks = (view = 'default') => (dispatch:Function) => {
  dispatch(setLoadFlags(view, { loading: true, loaded: false }));

  dispatch(loadTasks(view === 'completed'))
    .then((tasks:Task[]) => {
      const recurringConfigIds = uniq(tasks.map((t) => t.recurringConfigId).filter(Boolean));
      return dispatch(loadRecurringConfigs(recurringConfigIds as string[]));
    })
    .then(() => {
      dispatch(setLoadFlags(view, { loading: false, loaded: true }));
    })
    .catch((error:Error) => {
      console.error(error);
      dispatch(setLoadFlags(view, { loading: false, loaded: false }));
    });
};

export const resumeDashboardActivity = (() => {
  let lastTime = Date.now();
  const timeout = 1000 * 60 * 30; // 30 minutes;

  return () => (dispatch:Function) => {
    const now = Date.now();
    if (now > lastTime + timeout) {
      console.log('[resumeDashboardActivity] Refreshing tasks due to resumed activity');
      dispatch(resetTasks());
    }
    lastTime = now;
  };
})();

export const setAccountMenuOpen = (accountMenuOpen:boolean) => ({
  type: SET_ACCOUNT_MENU_OPEN,
  payload: accountMenuOpen,
});
