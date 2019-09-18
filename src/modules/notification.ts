import createReducer from '../util/createReducer';

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

type NotificationParams = {
  uid: string,
  message: string,
  type: string,
  callbackButton?: string,
};

export const reducer = createReducer(INITIAL_STATE, {
  [SHOW]: (state:S, action: { payload: NotificationParams }) => ({
    ...state,
    uid: action.payload.uid,
    message: action.payload.message,
    callbackButton: action.payload.callbackButton,
    type: action.payload.type,
  }),
  [HIDE]: (state:S) => ({
    ...state,
    uid: null,
  }),
});

type S = ReturnType<typeof reducer>;
type AS = { [NAMESPACE]: S };

// Selectors

export const selectUid = (state:AS) => state[NAMESPACE].uid;
export const selectMessage = (state:AS) => state[NAMESPACE].message;
export const selectCallbackButton = (state:AS) => state[NAMESPACE].callbackButton;
export const selectType = (state:AS) => state[NAMESPACE].type;

// Actions
const duration = 3000;

const callbacks:{ [key:string]:Function|undefined } = {};
const timeouts: { [key:string]:ReturnType<typeof setTimeout> } = {};

export const hideNotification = (uid:string) => (dispatch:Function, getState:Function) => {
  clearInterval(timeouts[uid]);
  delete timeouts[uid];
  delete callbacks[uid];

  const state = getState();
  const currentUid = selectUid(state);

  if (currentUid === uid) {
    dispatch({ type: HIDE });
  }
};

type OptionalNotificationParams = {
  callbackButton?: string,
  callbackFunction?: Function,
};

const showNotification = (
  type:string,
  message:string,
  { callbackButton, callbackFunction }:OptionalNotificationParams = {},
) => (
  (dispatch:Function) => {
    const uid = `${Math.round(Math.random() * 10000)}`;
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

export const showInfoNotification = (
  message:string,
  { callbackButton, callbackFunction }:OptionalNotificationParams = {},
) => (
  showNotification('info', message, { callbackButton, callbackFunction })
);

export const showErrorNotification = (
  message:string,
  { callbackButton, callbackFunction }:OptionalNotificationParams = {},
) => (
  showNotification('error', message, { callbackButton, callbackFunction })
);

export const showNetworkErrorNotification = () => showErrorNotification('Error');

export const runNotificationCallback = (uid:string) => (dispatch:Function) => {
  const callbackFunction = callbacks[uid];
  if (callbackFunction) {
    dispatch(callbackFunction());
  }
  dispatch(hideNotification(uid));
};
