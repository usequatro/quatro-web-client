import get from 'lodash/get';
import { createSlice } from '@reduxjs/toolkit';

import {
  fetchUpdateUserExternalConfig,
  listenToUserExternalConfigDocument,
} from '../utils/apiClient';
import debugConsole from '../utils/debugConsole';
import { selectUserId } from './session';
import { getBrowserDetectedTimeZone } from '../utils/timeZoneUtils';

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
export const selectUserTimeZone = (state) => get(state[name].data, 'timeZone');

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
    setData: (_, { payload }) => ({
      status: LOADED,
      data: payload,
    }),
  },
});

export default slice;

// Thunks

export const listenToUserExternalConfig = () => (dispatch, getState) => {
  const state = getState();
  const userId = selectUserId(state);

  if (!userId) {
    throw new Error('No userId');
  }

  const onNext = (data = null) => {
    dispatch(slice.actions.setData(data));

    // When user doesn't have a timezone, we try to fix it :)
    if (!data.timeZone) {
      const browserDetectedTimeZone = getBrowserDetectedTimeZone();
      if (browserDetectedTimeZone) {
        fetchUpdateUserExternalConfig({ timeZone: browserDetectedTimeZone });
      }
    }
    // nextCallback(data);
  };
  const onError = (error) => {
    console.error(error); // eslint-disable-line no-console
    // errorCallback(error);
  };
  dispatch(slice.actions.resetLocalState());
  const unsubscribe = listenToUserExternalConfigDocument(userId, onNext, onError);

  return () => {
    debugConsole.log('Firestore', 'listenToUserExternalConfig', 'unsubscribe');
    unsubscribe();
  };
};
