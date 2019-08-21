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
  type: '',
};

export const reducer = createReducer(INITIAL_STATE, {
  [SHOW]: (state, action) => ({
    ...state,
    uid: action.payload.uid,
    message: action.payload.message,
    callbackButton: action.payload.callbackButton,
    type: action.payload.type,
  }),
  [HIDE]: (state) => ({
    ...state,
    uid: null,
  }),
});

// Selectors

export const selectUid = (state) => state[NAMESPACE].uid;
export const selectMessage = (state) => state[NAMESPACE].message;
export const selectCallbackButton = (state) => state[NAMESPACE].callbackButton;
export const selectType = (state) => state[NAMESPACE].type;

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

const showNotification = (message, { callbackButton, callbackFunction, type } = {}) => (
  (dispatch) => {
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
        uid, message, callbackButton, type,
      },
    });

    return uid;
  }
);

export const showInfoNotification = (message, { callbackButton, callbackFunction } = {}) => (
  showNotification(message, { callbackButton, callbackFunction, type: 'info' })
);

export const showErrorNotification = (message, { callbackButton, callbackFunction } = {}) => (
  showNotification(message, { callbackButton, callbackFunction, type: 'error' })
);

export const showNetworkErrorNotification = () => (
  showErrorNotification('Error')
);

export const runNotificationCallback = (uid = isRequired()) => (dispatch) => {
  const callbackFunction = callbacks[uid];
  dispatch(callbackFunction());
  dispatch(hideNotification(uid));
};
