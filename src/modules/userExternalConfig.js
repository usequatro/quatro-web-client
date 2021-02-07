import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';

import { listenToUserExternalConfigDocument } from '../utils/apiClient';
import debugConsole from '../utils/debugConsole';
import { selectUserId } from './session';

const name = 'userExternalConfig';

const INITIAL = 'initial';
const LOADED = 'loaded';

// Selectors

/** @returns {boolean} */
export const selectUserExternalConfigIsFetching = (state) => state[name].status === INITIAL;
/** @returns {boolean} */
export const selectUserHasGrantedGoogleCalendarOfflineAccess = (state) =>
  Boolean(get(state[name].data, 'gapiCalendarOfflineAccess', false));
/** @returns {string|null} */
export const selectUserDefaultCalendarId = (state) => get(state[name].data, 'defaultCalendarId');

// Slice

const initialState = {
  status: INITIAL,
  data: null,
};

const slice = createSlice({
  name,
  initialState,
  reducers: {
    resetLocalState: () => initialState,
    setData: (state, { payload }) => ({
      status: LOADED,
      data: payload,
    }),
  },
});

export default slice;

// Thunks

export const listenToUserExternalConfig = (nextCallback = () => {}, errorCallback = () => {}) => (
  dispatch,
  getState,
) => {
  const state = getState();
  const userId = selectUserId(state);

  if (!userId) {
    throw new Error('No userId');
  }

  const onNext = (data = null) => {
    dispatch(slice.actions.setData(data));
    nextCallback(data);
  };
  const onError = (error) => {
    errorCallback(error);
  };
  dispatch(slice.actions.resetLocalState());
  const unsubscribe = listenToUserExternalConfigDocument(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToUserExternalConfig', 'unsubscribe');
    unsubscribe();
  };
};
