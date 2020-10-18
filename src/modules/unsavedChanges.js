import { takeEvery, put, debounce, select, call } from 'redux-saga/effects';
import isEmpty from 'lodash/isEmpty';

import createReducer from '../utils/createReducer';
import { RESET } from './reset';
import { UPDATE as UPDATE_TASK } from './tasks';
import {
  UPDATE as UPDATE_RECURRING_CONFIG,
  DELETE as DELETE_RECURRING_CONFIG,
} from './recurringConfigs';
import { fetchUpdateTaskBatch, fetchUpdateRecurringConfigBatch } from '../utils/apiClient';

export const NAMESPACE = 'unsavedChanges';

// Action types

const ADD_CHANGES = `${NAMESPACE}/ADD_CHANGES`;
const RESTORE_CHANGES = `${NAMESPACE}/RESTORE_CHANGES`;
const CLEAR_CHANGES = `${NAMESPACE}/CLEAR_CHANGES`;
const SET_STATUS = `${NAMESPACE}/SET_STATUS`;

// Reducers

const READY = 'ready';
export const SAVING = 'saving';
export const ERROR = 'error';

const INITIAL_STATE = {
  status: READY,
  byTaskId: {},
  byRecurringConfigId: {},
};

export const reducer = createReducer(INITIAL_STATE, {
  [RESET]: () => ({ ...INITIAL_STATE }),
  [ADD_CHANGES]: (
    state,
    { payload: { byTaskId: changesByTaskId, byRecurringConfigId: changesByRecurringConfigId } },
  ) => ({
    ...state,
    byTaskId: {
      ...state.byTaskId,
      ...Object.entries(changesByTaskId || {}).reduce(
        (memo, [id, taskChanges]) => ({
          ...memo,
          [id]: taskChanges,
        }),
        {},
      ),
    },
    byRecurringConfigId: {
      ...state.byRecurringConfigId,
      ...Object.entries(changesByRecurringConfigId || {}).reduce(
        (memo, [id, recurringConfigChanges]) => ({
          ...memo,
          [id]: recurringConfigChanges,
        }),
        {},
      ),
    },
  }),
  // @todo: simplify or avoid duplication
  [RESTORE_CHANGES]: (
    state,
    { payload: { byTaskId: changesByTaskId, byRecurringConfigId: changesByRecurringConfigId } },
  ) => ({
    ...state,
    byTaskId: {
      ...state.byTaskId,
      ...Object.entries(changesByTaskId || {}).reduce(
        (memo, [id, taskChanges]) => ({
          ...memo,
          [id]: taskChanges,
        }),
        {},
      ),
    },
    byRecurringConfigId: {
      ...state.byRecurringConfigId,
      ...Object.entries(changesByRecurringConfigId || {}).reduce(
        (memo, [id, recurringConfigChanges]) => ({
          ...memo,
          [id]: recurringConfigChanges,
        }),
        {},
      ),
    },
  }),
  [CLEAR_CHANGES]: (state) => ({
    ...state,
    byTaskId: {},
    byRecurringConfigId: {},
  }),
  [SET_STATUS]: (state, { payload }) => ({
    ...state,
    status: payload,
  }),
});

// Selectors

export const selectHasUnsavedChanges = (state) =>
  !isEmpty(state[NAMESPACE].byTaskId) || !isEmpty(state[NAMESPACE].byRecurringConfigId);
export const selectUnsavedChangesByTaskId = (state) => state[NAMESPACE].byTaskId;
export const selectUnsavedChangesByRecurringConfigIdId = (state) =>
  state[NAMESPACE].byRecurringConfigId;
export const selectUnsavedChangesIsStatus = (state) => state[NAMESPACE].status;
export const selectUnsavedChangesSaving = (state) => state[NAMESPACE].status === SAVING;

// Sagas

function* addTaskChanges({ payload: { id, updates } }) {
  if (!id || !updates) {
    throw new Error('Invalid task add changes action payload');
  }
  yield put({
    type: ADD_CHANGES,
    payload: { byTaskId: { [id]: updates } },
  });
}

function* addRecurringConfigChanges({ payload: { id, updates } }) {
  if (!id || !updates) {
    throw new Error('Invalid recurring config add changes action payload');
  }
  yield put({
    type: ADD_CHANGES,
    payload: { byRecurringConfigId: { [id]: updates } },
  });
}

function* addRecurringConfigDeletions({ payload: { id } }) {
  if (!id) {
    throw new Error('Invalid recurring config deletion action payload');
  }
  yield put({
    type: ADD_CHANGES,
    payload: { byRecurringConfigId: { [id]: null } },
  });
}

function* autosave() {
  const changesByTaskId = yield select(selectUnsavedChangesByTaskId);
  const changesByRecurringConfigId = yield select(selectUnsavedChangesByRecurringConfigIdId);
  yield put({ type: CLEAR_CHANGES });
  yield put({ type: SET_STATUS, payload: SAVING });

  // Task batch update
  try {
    yield call(fetchUpdateTaskBatch, changesByTaskId);
    yield put({ type: SET_STATUS, payload: READY });
  } catch (error) {
    // @TODO: show error notification
    console.error(error); // eslint-disable-line no-console
    yield put({ type: SET_STATUS, payload: ERROR });

    // Re-insert changes that didn't save. This triggers another autosave
    yield put({
      type: RESTORE_CHANGES,
      payload: { byTaskId: changesByTaskId, byRecurringConfigId: changesByRecurringConfigId },
    });
  }

  // Recurring config batch update
  try {
    yield call(fetchUpdateRecurringConfigBatch, changesByRecurringConfigId);
    yield put({ type: SET_STATUS, payload: READY });
  } catch (error) {
    // @TODO: show error notification
    console.error(error); // eslint-disable-line no-console
    yield put({ type: SET_STATUS, payload: ERROR });

    // Re-insert changes that didn't save. This triggers another autosave
    yield put({
      type: RESTORE_CHANGES,
      payload: { byRecurringConfigId: changesByRecurringConfigId },
    });
  }
}

function* watchTaskChangesMade() {
  yield takeEvery(UPDATE_TASK, addTaskChanges);
}

function* watchRecurringConfigChangesMade() {
  yield takeEvery(UPDATE_RECURRING_CONFIG, addRecurringConfigChanges);
}

function* watchRecurringConfigDeletions() {
  yield takeEvery(DELETE_RECURRING_CONFIG, addRecurringConfigDeletions);
}

const SAVE_DEBOUNCE_TIMEOUT = 1000;

export function* watchAutosave() {
  yield debounce(SAVE_DEBOUNCE_TIMEOUT, ADD_CHANGES, autosave);
}

export const sagas = [
  watchTaskChangesMade(),
  watchRecurringConfigChangesMade(),
  watchRecurringConfigDeletions(),
  watchAutosave(),
];
