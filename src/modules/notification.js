import createReducer from '../util/createReducer';
import isRequired from '../util/isRequired';

export const NAMESPACE = 'notification';

// Action types

const SHOW = `${NAMESPACE}/SHOW`;
const HIDE = `${NAMESPACE}/HIDE`;

// Reducers

const INITIAL_STATE = {
  uid: null,
  message: '',
  callbackButton: '',
};

export const reducer = createReducer(INITIAL_STATE, {
  [SHOW]: (state, action) => ({
    ...state,
    uid: action.payload.uid,
    message: action.payload.message,
    callbackButton: action.payload.callbackButton,
  }),
  [HIDE]: state => ({
    ...state,
    uid: null,
  }),
});

// Selectors

export const selectUid = state => state[NAMESPACE].uid;
export const selectMessage = state => state[NAMESPACE].message;
export const selectCallbackButton = state => state[NAMESPACE].callbackButton;

// Actions
const duration = 3000;

const callbacks = {};
const timeouts = {};

export const hideNotification = (uid = isRequired()) => (dispatch, getState) => {
  clearInterval(timeouts[uid]);
  delete timeouts[uid];
  delete callbacks[uid];

  const state = getState();
  const currentUid = selectUid(state);

  if (currentUid === uid) {
    dispatch({ type: HIDE });
  }
};

export const showNotification = (message, { callbackButton, callbackFunction }) => (dispatch) => {
  const uid = Math.round(Math.random() * 10000);
  callbacks[uid] = callbackFunction;

  timeouts[uid] = setTimeout(() => {
    if (timeouts[uid]) {
      clearInterval(timeouts[uid]);
      dispatch(hideNotification(uid));
    }
  }, duration);

  dispatch({
    type: SHOW,
    payload: {
      uid, message, callbackButton,
    },
  });
};

export const runNotificationCallback = (uid = isRequired()) => (dispatch) => {
  const callbackFunction = callbacks[uid];
  dispatch(callbackFunction());
  dispatch(hideNotification(uid));
};
